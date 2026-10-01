import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { ParsePositiveIntPipe } from '../../common/pipes/parse-positive-int.pipe'
import { AuthenticatedUser } from '../../common/authenticated-user'
import { ListTrackCoursesDto, ListTracksDto, TrackDto } from './dto/track.dto'
import { TracksService } from './tracks.service'

@ApiTags('Tracks')
@ApiBearerAuth()
@Controller()
export class TracksController {
  constructor(private readonly tracks: TracksService) {}

  @Get('tracks')
  @ApiOperation({ summary: 'Lista trilhas' })
  list(@Query() filter: ListTracksDto) { return this.tracks.list(filter) }

  @Get('tracks/:id')
  get(@Param('id', ParsePositiveIntPipe) id: number) { return this.tracks.get(id) }

  @Post('tracks')
  @Roles('admin')
  @ApiOperation({ summary: 'Cria trilha e seus cursos em uma operação atômica (admin)' })
  create(@Body() input: TrackDto) { return this.tracks.create(input) }

  @Put('tracks/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Substitui dados, cursos e ordem da trilha em uma operação atômica (admin)' })
  update(@Param('id', ParsePositiveIntPipe) id: number, @Body() input: TrackDto) {
    return this.tracks.update(id, input)
  }

  @Delete('tracks/:id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204 })
  remove(@Param('id', ParsePositiveIntPipe) id: number) { return this.tracks.remove(id) }

  @Get('trackCourses')
  @ApiTags('TrackCourses')
  @ApiOperation({ summary: 'Lista vínculos de trilha; escrita é feita pelo recurso tracks' })
  listRelations(@Query() filter: ListTrackCoursesDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.tracks.listRelations(filter, actor)
  }

  @Get('trackCourses/:id')
  @ApiTags('TrackCourses')
  getRelation(@Param('id', ParsePositiveIntPipe) id: number, @CurrentUser() actor: AuthenticatedUser) {
    return this.tracks.getRelation(id, actor)
  }
}
