import 'reflect-metadata'
import { Container } from 'inversify'
import { IConfigService } from '../config/config.service.interface'
import { IUsersRepository } from './users.repository.interface'
import { IUsersService } from './users.service.interface'
import { TYPES } from '../types'
import { UsersService } from './users.service'
import { User } from './user.entity'
import { UserModel } from '@prisma/client'

const ConfigServiceMock: IConfigService = {
	get: jest.fn(),
}

const UsersRepositoryMock: IUsersRepository = {
	find: jest.fn(),
	create: jest.fn(),
}

const container = new Container()
let configService: IConfigService
let usersRepository: IUsersRepository
let userService: IUsersService

beforeAll(() => {
	container.bind<IUsersService>(TYPES.UsersService).to(UsersService)
	container.bind<IConfigService>(TYPES.ConfigService).toConstantValue(ConfigServiceMock)
	container.bind<IUsersRepository>(TYPES.UsersRepository).toConstantValue(UsersRepositoryMock)

	configService = container.get<IConfigService>(TYPES.ConfigService)
	usersRepository = container.get<IUsersRepository>(TYPES.UsersRepository)
	userService = container.get<IUsersService>(TYPES.UsersService)
})

let createdUser: UserModel | null

describe('User Service', () => {
	it('createUser', async () => {
		configService.get = jest.fn().mockReturnValueOnce('1')
		usersRepository.create = jest.fn().mockImplementationOnce(
			(user: User): UserModel => ({
				name: user.name,
				email: user.email,
				password: user.password,
				id: 1,
			}),
		)
		createdUser = await userService.createUser({
			email: 'a@a,ru',
			name: 'Влад',
			password: '1',
		})

		expect(createdUser?.id).toEqual(1)
		expect(createdUser?.password).not.toEqual('1')
	})

	it('validateUser - success', async () => {
		usersRepository.find = jest.fn().mockReturnValueOnce(createdUser)
		const res = await userService.validateUser({
			email: 'a@a,ru',
			password: '1',
		})
		expect(res).toBeTruthy()
	})

	it('validateUser - wrong password', async () => {
		usersRepository.find = jest.fn().mockReturnValueOnce(createdUser)

		const res = await userService.validateUser({
			email: 'a@a,ru',
			password: '2',
		})
		expect(res).toBeFalsy()
	})

	it('validateUser - have not found user', async () => {
		usersRepository.find = jest.fn().mockReturnValueOnce(null)

		const res = await userService.validateUser({
			email: 'a2@a,ru',
			password: '1',
		})
		expect(res).toEqual(false)
	})
})
