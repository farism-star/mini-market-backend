import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum MessageType {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  VOICE = "VOICE"
}

export class SendMessageDto {
  @IsString()
  conversationId: string;

  @IsString()
  senderId: string;

  @IsEnum(MessageType)
  type: MessageType;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  voice?: string;




}
