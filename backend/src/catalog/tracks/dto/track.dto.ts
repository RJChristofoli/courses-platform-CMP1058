import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { ArrayUnique, IsArray, IsInt, IsOptional, IsString, Length, Min } from 'class-validator'

export class TrackDto {
  @ApiProperty({ maxLength: 200 })
  @IsString()
  @Length(1, 200)
  title!: string

  @ApiProperty({ maxLength: 5000 })
  @IsString()
  @Length(0, 5000)
  description!: string

  @ApiProperty({ minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId!: number

  @ApiProperty({ type: [Number], example: [1, 2] })
  @IsArray()
  @ArrayUnique()
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  courseIds!: number[]
}

export class ListTracksDto {
  @ApiProperty({ required: false, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId?: number
}

export class ListTrackCoursesDto {
  @ApiProperty({ required: false, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  trackId?: number

  @ApiProperty({ required: false, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  courseId?: number
}
