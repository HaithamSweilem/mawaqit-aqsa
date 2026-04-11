import { z } from 'zod';

export const PrayerTime = z.object({
    hour: z.string(),
    minute: z.string(),
    second: z.string(),
});
