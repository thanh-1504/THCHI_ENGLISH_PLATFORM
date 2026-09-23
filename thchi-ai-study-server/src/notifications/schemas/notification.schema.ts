import z from 'zod';

const NotificationSchema = z.object({
  type: z.enum(["POST_LIKED", "POST_COMMENTED", "POST_APPROVED"]),
  title: z.string(),
  body: z.string(),
  isRead: z.boolean().default(false),
  postId: z.string().optional(),
});

export const MarkAsReadSchema = NotificationSchema.pick({
  isRead: true,
});

export const CreateNotificaionSchema = NotificationSchema.omit({
  isRead: true,
});


export type NotificationSchemaType = z.infer<typeof NotificationSchema>;
export type MarkAsReadType = z.infer<typeof MarkAsReadSchema>;
export type CreateNotificationType = z.infer<typeof CreateNotificaionSchema>;
