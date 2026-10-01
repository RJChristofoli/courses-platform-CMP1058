import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { ParsePositiveIntPipe } from '../../common/pipes/parse-positive-int.pipe'
import { AuthenticatedUser } from '../../common/authenticated-user'
import { ListTrackCoursesDto, ListTracksDto, TrackDto } from './dto/track.dto'
import { TracksService } from './tracks.service'
import { ApiCommonErrors, ApiCreatedItemResponse, ApiDeletedResponse, ApiItemResponse, ApiListResponse } from '../../common/openapi/api-docs'
import { TrackCourseResponseDto, TrackResponseDto } from '../../common/openapi/api-models.dto'

@ApiTags('Tracks')
@ApiBearerAuth()
@ApiCommonErrors()
@Controller()
export class TracksController {
  constructor(private readonly tracks: TracksService) {}

  @Get('tracks')
  @ApiOperation({ summary: 'Lista trilhas' })
  @ApiListResponse(TrackResponseDto, 'Trilhas em ordem crescente de ID')
  list(@Query() filter: ListTracksDto) { return this.tracks.list(filter) }

  @Get('tracks/:id')
  @ApiItemResponse(TrackResponseDto, 'Trilha consultada')
  get(@Param('id', ParsePositiveIntPipe) id: number) { return this.tracks.get(id) }

  @Post('tracks')
  @Roles('admin')
  @ApiOperation({ summary: 'Cria trilha e seus cursos em uma operação atômica (admin)' })
  @ApiCreatedItemResponse(TrackResponseDto, 'Trilha criada')
  create(@Body() input: TrackDto) { return this.tracks.create(input) }

  @Put('tracks/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Substitui dados, cursos e ordem da trilha em uma operação atômica (admin)' })
  @ApiItemResponse(TrackResponseDto, 'Trilha atualizada')
  update(@Param('id', ParsePositiveIntPipe) id: number, @Body() input: TrackDto) {
    return this.tracks.update(id, input)
  }

  @Delete('tracks/:id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDeletedResponse('Trilha removida; referências opcionais do certificado são limpas')
  remove(@Param('id', ParsePositiveIntPipe) id: number) { return this.tracks.remove(id) }

  @Get('trackCourses')
  @ApiTags('TrackCourses')
  @ApiOperation({ summary: 'Lista vínculos de trilha; escrita é feita pelo recurso tracks' })
  @ApiListResponse(TrackCourseResponseDto, 'Vínculos planos filtráveis por trilha ou curso')
  listRelations(@Query() filter: ListTrackCoursesDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.tracks.listRelations(filter, actor)
  }

  @Get('trackCourses/:id')
  @ApiTags('TrackCourses')
  @ApiItemResponse(TrackCourseResponseDto, 'Vínculo consultado')
  getRelation(@Param('id', ParsePositiveIntPipe) id: number, @CurrentUser() actor: AuthenticatedUser) {
    return this.tracks.getRelation(id, actor)
  }
}
