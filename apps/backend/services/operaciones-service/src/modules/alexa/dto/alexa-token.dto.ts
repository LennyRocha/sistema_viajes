import { IsNotEmpty, IsString } from "class-validator";

export class CreateAlexaTokenDto {
  @IsString()
  @IsNotEmpty()
  secret!: string;
}
