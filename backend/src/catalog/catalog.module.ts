import { Module } from '@nestjs/common'
import { CategoriesController } from './categories/categories.controller'
import { CategoriesRepository } from './categories/categories.repository'
import { CategoriesService } from './categories/categories.service'
import { CoursesController } from './courses/courses.controller'
import { CoursesRepository } from './courses/courses.repository'
import { CoursesService } from './courses/courses.service'
import { LessonsController } from './lessons/lessons.controller'
import { LessonsRepository } from './lessons/lessons.repository'
import { LessonsService } from './lessons/lessons.service'
import { ModulesController } from './modules/modules.controller'
import { ModulesRepository } from './modules/modules.repository'
import { ModulesService } from './modules/modules.service'
import { TracksController } from './tracks/tracks.controller'
import { TrackCoursesRepository } from './tracks/track-courses.repository'
import { TracksRepository } from './tracks/tracks.repository'
import { TracksService } from './tracks/tracks.service'

@Module({
  controllers: [CategoriesController, CoursesController, ModulesController, LessonsController, TracksController],
  providers: [
    CategoriesRepository, CategoriesService,
    CoursesRepository, CoursesService,
    ModulesRepository, ModulesService,
    LessonsRepository, LessonsService,
    TracksRepository, TrackCoursesRepository, TracksService,
  ],
})
export class CatalogModule {}
