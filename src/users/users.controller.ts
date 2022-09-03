import { BaseController } from '../common/base.controller'
import { NextFunction, Request, Response } from 'express'
import { HTTTPError } from '../errors/http-error.class'
import { inject, injectable } from 'inversify'
import { TYPES } from '../types'
import { ILogger } from '../logger/logger.interface'
import 'reflect-metadata'
import { IUsersController } from './users.controller.interface'
import { UserLoginDto } from './dto/user-login.dto'
import { UserRegisterDto } from './dto/user-register.dto'
import { IUsersService } from './users.service.interface'
import { ValidateMiddleware } from '../common/validate.middleware'
import { sign } from 'jsonwebtoken'
import { IConfigService } from '../config/config.service.interface'
import { config } from 'dotenv'
import { AuthGuard } from '../common/auth.guard'

@injectable()
export class UsersController extends BaseController implements IUsersController {
	constructor(
		@inject(TYPES.ILogger) private loggerService: ILogger,
		@inject(TYPES.UsersService) private userService: IUsersService,
		@inject(TYPES.ConfigService) private configService: IConfigService,
	) {
		super(loggerService)
		this.bindRoutes([
			{
				path: '/register',
				method: 'post',
				func: this.register,
				middlewares: [new ValidateMiddleware(UserRegisterDto)],
			},
			{
				path: '/login',
				method: 'post',
				func: this.login,
				middlewares: [new ValidateMiddleware(UserLoginDto)],
			},
			{
				path: '/info',
				method: 'get',
				func: this.info,
				middlewares: [new AuthGuard()],
			},
		])
	}

	async login(
		req: Request<{}, {}, UserLoginDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const result = await this.userService.validateUser(req.body)
		if (!result) {
			return next(new HTTTPError(401, 'Ошибка авторизации', 'login'))
		}
		const jwt = await this.signJWT(req.body.email, this.configService.get('SECRET'))

		this.ok(res, { jwt })
	}

	async register(
		{ body }: Request<{}, {}, UserRegisterDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const user = await this.userService.createUser(body)
		if (!user) {
			return next(new HTTTPError(422, 'такой пользователь уже существует'))
		}
		this.ok(res, { email: user.email, id: user.id })
	}

	private signJWT(email: string, secret: string): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			sign(
				{
					email,
					iat: Math.floor(Date.now() / 1000),
				},
				secret,
				{ algorithm: 'HS256' },
				(error, token) => {
					if (error) {
						reject(error)
					}
					resolve(token as string)
				},
			)
		})
	}

	async info({ user }: Request<{}, {}, any>, res: Response, next: NextFunction): Promise<void> {
		const userInfo = await this.userService.getUserInfo(user)
		this.ok(res, { email: userInfo?.email, id: userInfo?.id })
	}
}
