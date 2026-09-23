import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Roles } from 'src/shared/decorators/role.decorator';
import { CreatePremiumPlanDTO } from './dtos/create-premium.dto';
import { UpdatePremiumPlanDTO } from './dtos/update-premium.dto';
import { PremiumService } from './premium.service';

@Controller('premium')
export class PremiumController {
  constructor(private readonly premiumService: PremiumService) {}

  @Get()
  getAllPlans(@Query('page') page: string, @Query('limit') limit: string) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;
    return this.premiumService.getAllPlans(pageNum, limitNum);
  }

  @Roles('ADMIN')
  @Post()
  createPremiumPlan(@Body() payload: CreatePremiumPlanDTO) {
    return this.premiumService.createPremiumPlan(payload);
  }

  @Roles('ADMIN')
  @Patch('/:id')
  updatePremiumPlan(
    @Param('id') id: string,
    @Body() payload: UpdatePremiumPlanDTO,
  ) {
    return this.premiumService.updatePremiumPlan(id, payload);
  }

  @Roles('ADMIN')
  @Patch('/:id/status')
  togglePlanStatus(@Param('id') id: string) {
    return this.premiumService.togglePlanStatus(id);
  }
}
