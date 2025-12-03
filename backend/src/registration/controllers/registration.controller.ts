import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegistrationService } from '../services/registration.service';
import { Participant } from '../entities/participant.entity';

@ApiTags('Registration')
@Controller('registration')
export class RegistrationController {
    constructor(private readonly registrationService: RegistrationService) { }

    @Post('batch/:batchId')
    @ApiOperation({ summary: 'Register for an event batch' })
    @ApiResponse({ status: 201, description: 'Registration successful' })
    async register(
        @Param('batchId') batchId: string,
        @Body() participantData: Partial<Participant>,
    ) {
        return await this.registrationService.register(batchId, participantData);
    }

    @Get('reference/:code')
    @ApiOperation({ summary: 'Get registration by reference code' })
    @ApiResponse({ status: 200, description: 'Registration details' })
    async getByReference(@Param('code') code: string) {
        return await this.registrationService.getRegistrationByReference(code);
    }
}
