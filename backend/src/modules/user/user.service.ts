// user.service.ts - User Authentication Service
import {
  Injectable,
  Inject,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as bcrypt from 'bcrypt';
import { DATABASE_CONNECTION } from '../../database/database.module';
import * as schema from '../../database/schema';
import { RegisterDto, LoginDto, AuthResponse } from './dto/user.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  private readonly saltRounds: number;

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: PostgresJsDatabase<typeof schema>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    const saltRoundsEnv = this.configService.get<string>('BCRYPT_SALT_ROUNDS');
    this.saltRounds = saltRoundsEnv ? parseInt(saltRoundsEnv, 10) : 12;
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    // Check if email already exists
    const existingUser = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, registerDto.email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new ConflictException('Email already registered');
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(registerDto.password, this.saltRounds);

    // Create user
    const [newUser] = await this.db
      .insert(schema.users)
      .values({
        fullName: registerDto.fullName,
        email: registerDto.email,
        password: hashedPassword,
        role: 'user',
      })
      .returning();

    this.logger.log(`User registered: ${newUser.email}`);

    // Generate JWT token
    const payload = { sub: newUser.id, email: newUser.email, role: newUser.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt?.toISOString(),
      },
      accessToken,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    // Find user by email
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, loginDto.email))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password using timing-safe comparison via bcrypt
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    this.logger.log(`User logged in: ${user.email}`);

    // Generate JWT token
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt?.toISOString(),
      },
      accessToken,
    };
  }

  async getProfile(userId: number) {
    const [user] = await this.db
      .select({
        id: schema.users.id,
        fullName: schema.users.fullName,
        email: schema.users.email,
        role: schema.users.role,
        createdAt: schema.users.createdAt,
      })
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      ...user,
      createdAt: user.createdAt?.toISOString() ?? null,
    };
  }
}
