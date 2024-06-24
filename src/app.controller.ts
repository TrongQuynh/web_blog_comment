import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller("heal-check")
export class AppController{
    @Get()
    public healthCheck(@Res() response: Response){
        return response.json({
            message: "Heal check Ok",
            status: 200,
            data: null
        })
    }
}