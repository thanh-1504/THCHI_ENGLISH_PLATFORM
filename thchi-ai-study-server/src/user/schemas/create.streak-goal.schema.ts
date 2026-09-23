import { z } from 'zod';

const CreateStreakGoalSchema = z.object({
  configId: z.string().uuid(),
});

export default CreateStreakGoalSchema;
export type CreateStreakGoalType = z.infer<typeof CreateStreakGoalSchema>;
