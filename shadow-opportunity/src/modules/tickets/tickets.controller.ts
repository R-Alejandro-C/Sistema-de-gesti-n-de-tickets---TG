import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, Query, Optional } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CreateTicketDto, UpdateTicketDto } from './dto/ticket.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Tickets')
@Controller('tickets')
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService) { }

    @Post()
    @ApiOperation({ summary: 'Crear ticket (Público o Autenticado)' })
    @UseGuards(new (class extends AuthGuard('jwt') {
        handleRequest(err: any, user: any) {
            // No lanzar error si no hay token — usuario anónimo
            return user || null;
        }
    })())
    create(@Body() createTicketDto: CreateTicketDto, @Request() req: any) {
        return this.ticketsService.create(createTicketDto, req.user || null);
    }

    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('metrics/overview')
    @Roles('ADMIN', 'SOPORTE')
    @ApiOperation({ summary: 'Obtener métricas y estadísticas de tickets (Overview)' })
    getMetricsOverview(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
        return this.ticketsService.getMetricsOverview(startDate, endDate);
    }

    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('metrics/tickets-by-status')
    @Roles('ADMIN', 'SOPORTE')
    @ApiOperation({ summary: 'Obtener distribución de tickets por estado' })
    getTicketsByStatus(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
        return this.ticketsService.getTicketsByStatus(startDate, endDate);
    }

    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('metrics/tickets-by-category')
    @Roles('ADMIN', 'SOPORTE')
    @ApiOperation({ summary: 'Obtener distribución de tickets por categoría' })
    getTicketsByCategory(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
        return this.ticketsService.getTicketsByCategory(startDate, endDate);
    }

    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('metrics/agent-performance')
    @Roles('ADMIN', 'SOPORTE')
    @ApiOperation({ summary: 'Obtener rendimiento por agente (productividad)' })
    getAgentPerformance(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
        return this.ticketsService.getAgentPerformance(startDate, endDate);
    }

    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('metrics/tickets-by-area')
    @Roles('ADMIN', 'SOPORTE')
    @ApiOperation({ summary: 'Obtener distribución por área' })
    getTicketsByArea(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
        return this.ticketsService.getTicketsByArea(startDate, endDate);
    }

    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('metrics/tickets-by-local')
    @Roles('ADMIN', 'SOPORTE')
    @ApiOperation({ summary: 'Obtener distribución por local' })
    getTicketsByLocal(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
        return this.ticketsService.getTicketsByLocal(startDate, endDate);
    }

    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('metrics/tickets-by-priority')
    @Roles('ADMIN', 'SOPORTE')
    @ApiOperation({ summary: 'Obtener distribución por prioridad' })
    getTicketsByPriority(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
        return this.ticketsService.getTicketsByPriority(startDate, endDate);
    }

    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get()
    @ApiOperation({ summary: 'Listar tickets' })
    findAll(@Query() pagination: PaginationDto, @Request() req) {
        return this.ticketsService.findAll(pagination, req.user);
    }

    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get(':id')
    @ApiOperation({ summary: 'Obtener detalle de ticket' })
    findOne(@Param('id') id: string, @Request() req) {
        return this.ticketsService.findOne(+id, req.user);
    }

    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Patch(':id')
    @Roles('ADMIN', 'SOPORTE')
    @ApiOperation({ summary: 'Actualizar/Gestionar ticket (Solo Soporte/Admin)' })
    update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto, @Request() req) {
        return this.ticketsService.update(+id, updateTicketDto, req.user.userId);
    }
}
