import { RaidDetailsRepository } from "./raid-details-repository-contract.js";
import { DataTypes, Sequelize } from 'sequelize';
import { RaidDetails } from "./raid-details.js";
import { RaidEmbedder } from "../raid-embedder.js";

export { SqliteRaidDetailsRepository };

class SqliteRaidDetailsRepository extends RaidDetailsRepository {
    
    constructor(databaseFilePath) {
        super();
        this.db = new Sequelize({
            dialect: 'sqlite',
            storage: databaseFilePath,
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
            channelId: { type: DataTypes.TEXT ,  primaryKey: true } ,
            serializedRaidDetails: DataTypes.TEXT,
        });

        await this.db.sync();
    }

    async getByChannelId(channelId) {
        const savedRaidDetails = await this.raidDetailsDao.findByPk(channelId);
        if (savedRaidDetails === null) return null;
        
        const deserializedDetails = JSON.parse(savedRaidDetails.serializedRaidDetails);
        
        const embedder = new RaidEmbedder(
            deserializedDetails.embedder.raidParameters, 
            deserializedDetails.embedder.author
        );
        embedder.members = deserializedDetails.embedder.members;
        embedder.loadEmbedder();

        return new RaidDetails(
            channelId, 
            deserializedDetails.messageId,
            embedder,
         )
    }

    async save(raidDetails) {
        const detailsFromDb = await this.raidDetailsDao.findByPk(raidDetails.channelId);
        if (detailsFromDb !== null) {
            detailsFromDb.serializedRaidDetails = JSON.stringify(raidDetails);
            detailsFromDb.save();
        } else {
            this.raidDetailsDao.create({
                channelId: raidDetails.channelId,  
                serializedRaidDetails: JSON.stringify(raidDetails),
            });
        }
    }
    
    async deleteByChannelId(channelId) {
        const raidDetails = await this.raidDetailsDao.findByPk(channelId);
        if (raidDetails !== null) {
            await raidDetails.destroy();
        }
    }

}
