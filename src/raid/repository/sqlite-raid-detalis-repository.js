import { RaidDetailsRepository } from "./raid-details-repository-contract.js";
import { DataTypes, Sequelize } from 'sequelize';
import { RaidDetails } from "./raid-details.js";
import { RaidEmbedder } from "../raid-embedder.js";
import { RaidMembersList } from "../raid-members-list.js";

export { SqliteRaidDetailsRepository };

class SqliteRaidDetailsRepository extends RaidDetailsRepository {
    
    constructor(databaseFilePath) {
        super();
        this.db = new Sequelize({
            dialect: 'sqlite',
            storage: databaseFilePath,
            logging: false,
        });
        this.raidDetailsDao = null;
    }

    async initializeDb() {
        try {
            this.db.authenticate();
            console.log('Connection has been established successfully.');
        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }
        
        this.raidDetailsDao = this.db.define('raid_details', {
            channelId: { type: DataTypes.TEXT, primaryKey: true },
            messageId: DataTypes.TEXT,
            raidsAuthor: DataTypes.TEXT,
            serializedRaidParameters: DataTypes.TEXT,
            serializedMainSquadMembers: DataTypes.TEXT,
            serializedReserveSquadMembers: DataTypes.TEXT,
        });

        await this.db.sync();
    }

    async getByChannelId(channelId) {
        const savedRaidDetails = await this.raidDetailsDao.findByPk(channelId);
        if (savedRaidDetails === null) return null;
        
        return new RaidDetails(
            channelId,
            savedRaidDetails.messageId,
            await this.#createEmbedderFromDetails(savedRaidDetails),
        );
    }

    async save(raidDetails) {
        const detailsFromDb = await this.raidDetailsDao.findByPk(raidDetails.channelId);
        if (detailsFromDb !== null) {
            detailsFromDb.serializedRaidParameters = JSON.stringify(raidDetails.embedder.raidParameters);
            detailsFromDb.serializedMainSquadMembers = JSON.stringify(raidDetails.embedder.getMainSquad().getMembers());
            detailsFromDb.serializedReserveSquadMembers = JSON.stringify(raidDetails.embedder.getReserveSquad().getMembers());
            detailsFromDb.save();
        } else {
            this.raidDetailsDao.create({
                channelId: raidDetails.channelId,  
                messageId: raidDetails.messageId,
                raidsAuthor: raidDetails.embedder.author,
                serializedRaidParameters: JSON.stringify(raidDetails.embedder.raidParameters),
                serializedMainSquadMembers: JSON.stringify(raidDetails.embedder.getMainSquad().getMembers()),
                serializedReserveSquadMembers: JSON.stringify(raidDetails.embedder.getReserveSquad().getMembers()),
            });
        }
    }
    
    async deleteByChannelId(channelId) {
        const raidDetails = await this.raidDetailsDao.findByPk(channelId);
        if (raidDetails !== null) {
            await raidDetails.destroy();
        }
    }

    async #createEmbedderFromDetails(savedRaidDetails) {
        const raidParameters = JSON.parse(savedRaidDetails.serializedRaidParameters);
        const embedder = new RaidEmbedder(raidParameters, savedRaidDetails.raidsAuthor);

        embedder.mainSquadList = new RaidMembersList(raidParameters.mainSquadMaxPlayers);
        embedder.reserveSquadList = new RaidMembersList(raidParameters.reserveSquadMaxPlayers);
        embedder.mainSquadList.members = JSON.parse(savedRaidDetails.serializedMainSquadMembers);
        embedder.reserveSquadList.members = JSON.parse(savedRaidDetails.serializedReserveSquadMembers);

        embedder.loadEmbedder();

        return embedder;
    }

}
