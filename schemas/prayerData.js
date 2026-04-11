import { z } from 'zod';
import { PrayerTime } from './prayerTime.js';

export const PrayerItem = z.object({
    date: z.string(),
    times: z.object({
        Fajr: PrayerTime,
        Shuruk: PrayerTime,
        Duhr: PrayerTime,
        Asr: PrayerTime,
        Maghrib: PrayerTime,
        Isha: PrayerTime,
    }),
});

export const PrayerData = z.array(PrayerItem); // kept if needed elsewhere
