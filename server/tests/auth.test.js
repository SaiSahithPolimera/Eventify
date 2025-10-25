import request from 'supertest';
import app from '../app.js';
import sql from '../db/conn.js';

async function seedUser({ name, email, password, role }) {
    const bcrypt = await import('bcrypt');
    const hashed = await bcrypt.hash(password, 9);

    await sql`DELETE FROM users WHERE email = ${email}`;

    await sql`
        INSERT INTO users (name, email, password_hash, role)
        VALUES (${name}, ${email}, ${hashed}, ${role})
    `;
}

describe('Authentication API Endpoints', () => {

    afterEach(async () => {
        await sql`DELETE FROM users`;
    });

    afterAll(async () => {
        await sql.end();
    });

    describe('POST /api/auth/signup', () => {
        it('should create a new attendee user successfully', async () => {
            const res = await request(app)
                .post('/api/auth/signup')
                .send({
                    name: 'Test Attendee',
                    email: 'attendee@test.com',
                    password: 'password123',
                    confirmPassword: 'password123',
                    role: 'attendee',
                });
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('success', true);
        });

        it('should create a new organizer user successfully', async () => {
            const res = await request(app)
                .post('/api/auth/signup')
                .send({
                    name: 'Test Organizer',
                    email: 'organizer@test.com',
                    password: 'password123',
                    confirmPassword: 'password123',
                    role: 'organizer',
                });
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('success', true);
        });

        it('should fail to create a user if the email already exists', async () => {
            await request(app)
                .post('/api/auth/signup')
                .send({
                    name: 'Existing User',
                    email: 'existing@test.com',
                    password: 'password123',
                    confirmPassword: 'password123',
                    role: 'organizer',
                });

            const res = await request(app)
                .post('/api/auth/signup')
                .send({
                    name: 'Another User',
                    email: 'existing@test.com',
                    password: 'password456',
                    confirmPassword: 'password456',
                    role: 'attendee',
                });

            expect(res.statusCode).toEqual(409);
            expect(res.body).toHaveProperty('success', false);
            expect(res.body).toHaveProperty('message', 'Email already exists!');
        });

        it('should fail if password and confirmPassword do not match', async () => {
            const res = await request(app)
                .post('/api/auth/signup')
                .send({
                    name: 'Mismatch Pass',
                    email: 'mismatch@test.com',
                    password: 'password123',
                    confirmPassword: 'password456',
                    role: 'attendee',
                });
            expect(res.statusCode).toEqual(400);
            expect(res.body.errors[0]).toHaveProperty('message', 'Passwords must match!');
        });

        it('should fail with invalid email format', async () => {
            const res = await request(app)
                .post('/api/auth/signup')
                .send({
                    name: 'Invalid Email User',
                    email: 'notanemail',
                    password: 'password123',
                    confirmPassword: 'password123',
                    role: 'attendee',
                });
            expect(res.statusCode).toEqual(400);
            expect(res.body.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ message: 'Email must be a valid address' })
                ])
            );
        });

        it('should fail with name too short', async () => {
            const res = await request(app)
                .post('/api/auth/signup')
                .send({
                    name: 'Short',
                    email: 'short@test.com',
                    password: 'password123',
                    confirmPassword: 'password123',
                    role: 'attendee',
                });
            expect(res.statusCode).toEqual(400);
            expect(res.body.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ message: 'Name must contain minimum 6 characters' })
                ])
            );
        });

        it('should fail with password too short', async () => {
            const res = await request(app)
                .post('/api/auth/signup')
                .send({
                    name: 'Valid Name',
                    email: 'valid@test.com',
                    password: 'short',
                    confirmPassword: 'short',
                    role: 'attendee',
                });
            expect(res.statusCode).toEqual(400);
            expect(res.body.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ message: 'Password must contain minimum 8 characters' })
                ])
            );
        });

        it('should fail with invalid role', async () => {
            const res = await request(app)
                .post('/api/auth/signup')
                .send({
                    name: 'Valid Name',
                    email: 'valid@test.com',
                    password: 'password123',
                    confirmPassword: 'password123',
                    role: 'admin',
                });
            expect(res.statusCode).toEqual(400);
            expect(res.body.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ message: "Role must be either 'organizer' or 'attendee'" })
                ])
            );
        });

        it('should fail with missing required fields', async () => {
            const res = await request(app)
                .post('/api/auth/signup')
                .send({});
            expect(res.statusCode).toEqual(400);
            expect(res.body.errors.length).toBeGreaterThan(0);
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            await seedUser({
                name: 'Login User',
                email: 'login@test.com',
                password: 'password123',
                role: 'attendee',
            });
        });

        it('should log in a user with correct credentials and set a cookie', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@test.com',
                    password: 'password123',
                });
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('success', true);
            expect(res.headers['set-cookie'][0]).toContain('token=');
        });

        it('should fail to log in with an incorrect password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@test.com',
                    password: 'wrongpassword',
                });
            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty('success', false);
            expect(res.body).toHaveProperty('message', 'Incorrect password!');
        });

        it('should fail to log in with a non-existent email', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nouser@test.com',
                    password: 'password123',
                });
            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty('success', false);
            expect(res.body).toHaveProperty('message', 'User not found!');
        });

        it('should fail with invalid email format', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'invalidemail',
                    password: 'password123',
                });
            expect(res.statusCode).toEqual(400);
            expect(res.body.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ message: 'Email must be a valid address' })
                ])
            );
        });

        it('should fail with missing credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({});
            expect(res.statusCode).toEqual(400);
            expect(res.body.errors.length).toBeGreaterThan(0);
        });
    });

    describe('POST /api/auth/logout', () => {
        beforeEach(async () => {
            await seedUser({
                name: 'Logout User',
                email: 'logout@test.com',
                password: 'password123',
                role: 'attendee',
            });
        });

        it('should log out a user and clear the cookie', async () => {
            const loginAgent = request.agent(app);
            await loginAgent
                .post('/api/auth/login')
                .send({
                    email: 'logout@test.com',
                    password: 'password123',
                });

            const res = await loginAgent.post('/api/auth/logout');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('success', true);
            expect(res.headers['set-cookie'][0]).toContain('token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
        });
    });
});
