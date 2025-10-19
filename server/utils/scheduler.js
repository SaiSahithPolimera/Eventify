import cron from 'node-cron';
import { queries } from '../db/queries.js';
import { sendEventReminder } from '../utils/emailService.js';

export const startReminderScheduler = () => {
  const schedule = process.env.NODE_ENV === 'development' 
    ? '*/5 * * * *'
    : '*/15 * * * *';
  
  cron.schedule(schedule, async () => {
    await checkAndSendReminders();
  });

  console.log('Reminder scheduler started');
};

const checkAndSendReminders = async () => {
  try {
    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const upcomingRsvps = await queries.getRsvpsForUpcomingEvents(now, twoHoursFromNow);

    if (!upcomingRsvps || upcomingRsvps.length === 0) {
      console.log('No events in next 2 hours');
      return;
    }


    let sentCount = 0;
    let failedCount = 0;

    const processedEmails = new Set();

    for (const rsvp of upcomingRsvps) {
      try {
        if (!rsvp.email || !rsvp.title) {
          console.error(`Invalid RSVP data: ${rsvp.id}`);
          failedCount++;
          continue;
        }

        const emailKey = `${rsvp.email}:${rsvp.event_id}`;
        if (processedEmails.has(emailKey)) {
          continue;
        }

        const sent = await sendEventReminder(rsvp.email, {
          title: rsvp.title,
          date: rsvp.date,
          location: rsvp.location,
        });

        if (sent) {
          sentCount++;
          processedEmails.add(emailKey);
        } else {
          failedCount++;
        }
      } catch (error) {
        failedCount++;
        console.error(`Error processing RSVP ${rsvp.id}:`, error.message);
      }
    }

  } catch (error) {
    console.error('Error checking for reminders:', error);
  }
};

export const triggerReminderCheck = async () => {
  await checkAndSendReminders();
};