import { NextFunction, Request, Response } from 'express'
import { LoggerService } from '../logger/logger.service'
import { IExceptionFilter } from './exception.filter.interface'
import { HTTTPError } from './http-error.class'
import { inject, injectable } from 'inversify'
import { ILogger } from '../logger/logger.interface'
import { TYPES } from '../types'
import 'reflect-metadata'

@injectable()
export class ExceptionFilter implements IExceptionFilter {
	constructor(@inject(TYPES.ILogger) private logger: ILogger) {}

	catch(err: Error | HTTTPError, req: Request, res: Response, next: NextFunction): void {
		if (err instanceof HTTTPError) {
			this.logger.error(`[${err.context}] Ошибка: ${err.statusCode} ${err.message}`)
			res.status(err.statusCode).send({ err: err.message })
		} else {
			this.logger.error(`${err.message}`)

			res.status(500).send({ err: err.message })
		}
	}
}
