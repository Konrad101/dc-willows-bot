import { scheduleJob } from 'node-schedule';
import { DateTime, Duration } from 'luxon';

import { ScheduledRaidJobs } from './scheduled-raid-jobs.js';
import { RaidDMReminder } from './raid-dm-reminder.js';
import { RaidEndOfPriorityHandler } from './raid-end-of-priority-handler.js';
import { END_OF_PRIORITY_DURATION, REMINDER_BEFORE_RAID_EXECUTION_DURATION, EXPIRED_RAIDS_DURATION } from '../../config.js';

export { RaidSchedulersManager };

class RaidSchedulersManager {

    constructor(raidDetailsRepository, 
                messageFetcher,
                messageSender,
                guildId) {

        // Map<channelId: string, scheduledRaidJobs: ScheduledRaidJobs>  
        this.scheduledRaidJobsByChannel = new Map();

        this.raidDetailsRepository = raidDetailsRepository;
        this.messageFetcher = messageFetcher;
        this.raidEndOfPriorityHandler = new RaidEndOfPriorityHandler(messageSender, raidDetailsRepository, messageFetcher);
        this.raidDMReminder = new RaidDMReminder(messageSender, guildId);
    }

    async refreshSchedulers() {
        console.log("Refreshing all raids schedulers..");
        const allRaidDetails = await this.raidDetailsRepository.getAll();
        if (allRaidDetails.length > 0) {
            allRaidDetails.forEach(raidDetails => this.#refreshSchedulersFromRaidDetails(raidDetails));
        } else {
            this.#cancelAllJobs();
        }
    }

    async refreshChannelSchedulers(channelId) {
        this.#refreshSchedulersFromRaidDetails(
            await this.raidDetailsRepository.getByChannelId(channelId)
        );
    }

    cancelChannelSchedulers(channelId) {
        const scheduledRaidJobs = this.scheduledRaidJobsByChannel.get(channelId);
        if (scheduledRaidJobs !== undefined) {
            scheduledRaidJobs.jobs.forEach(job => job?.cancel());
        }
    }

    #cancelAllJobs() {
        for (const [key, value] of this.scheduledRaidJobsByChannel) {
            value.jobs.forEach(job => job?.cancel());
        }
        this.scheduledRaidJobsByChannel.clear();
    }

    #refreshSchedulersFromRaidDetails(raidDetails) {
        if (raidDetails === null) return;

        const scheduledRaidJobs = this.scheduledRaidJobsByChannel.get(raidDetails.channelId);
        const timestampAfterUpdate = raidDetails.embedder.raidParameters.startTimestamp;
        if (scheduledRaidJobs?.raidsTimestamp === timestampAfterUpdate) return;
        
        this.cancelChannelSchedulers(raidDetails.channelId);

        const autoDeletionJob = this.#createAutoDeletionJob(timestampAfterUpdate, 
            raidDetails.channelId, raidDetails.messageId);
        const endOfPriorityJob = this.#createEndOfPriorityJob(timestampAfterUpdate, 
            raidDetails.channelId);
        const reminderJob = this.#createReminderJob(timestampAfterUpdate, raidDetails.channelId);

        this.scheduledRaidJobsByChannel.set(
            raidDetails.channelId, 
            new ScheduledRaidJobs(timestampAfterUpdate, [ autoDeletionJob, endOfPriorityJob, reminderJob ])
        );
    }

    #createEndOfPriorityJob(raidsTimestamp, channelId) {
        const endOfPriorityDuration = Duration.fromISO(END_OF_PRIORITY_DURATION).toObject();
        const raidDateTime = DateTime.fromMillis(raidsTimestamp);
        return scheduleJob(
            raidDateTime.minus(endOfPriorityDuration).toMillis(), 
            async () => {
                console.log(`[scheduled] handling end of priority on channel: ${channelId}`);
                const raidDetails = await this.raidDetailsRepository.getByChannelId(channelId);
                if (raidDetails !== null) {
                    this.raidEndOfPriorityHandler.handle(raidDetails);
                } else {
                    console.log(`Could not find details for end of priority handler job on channel: ${channelId}`);
                }
            }
        );
    }

    #createAutoDeletionJob(raidsTimestamp, channelId, messageId) {
        const autoDeletionDuration = Duration.fromISO(EXPIRED_RAIDS_DURATION).toObject();
        const raidDateTime = DateTime.fromMillis(raidsTimestamp);
        return scheduleJob(
            raidDateTime.plus(autoDeletionDuration).toMillis(), 
            async () => {
                console.log(`[scheduled] auto deletion of raids list from channel: ${channelId}`);
                this.raidDetailsRepository.deleteByChannelId(channelId);
                const embedderMessage = await this.messageFetcher.fetchMessageFromChannel(messageId, channelId);
                embedderMessage?.edit({ content: "🗑️ Zapisy na rajdy zostały usunięte automatycznie", embeds: [], components: [] });
            }
        );
    }

    #createReminderJob(raidsTimestamp, channelId) {
        const reminderTimeBeforeRaid = Duration.fromISO(REMINDER_BEFORE_RAID_EXECUTION_DURATION).toObject();
        const raidDateTime = DateTime.fromMillis(raidsTimestamp);
        return scheduleJob(
            raidDateTime.minus(reminderTimeBeforeRaid).toMillis(), 
            async () => {
                console.log(`[scheduled] sending DMs with reminder about raids for channel: ${channelId}`);
                const raidDetails = await this.raidDetailsRepository.getByChannelId(channelId);
                if (raidDetails !== null) {
                    this.raidDMReminder.remindAboutRaid(raidDetails);
                } else {
                    console.log(`Could not find details for reminder job on channel: ${channelId}`);
                }
            }
        );
    }

}
