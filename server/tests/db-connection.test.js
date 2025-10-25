import sql from "../db/conn";

describe('Database Connection', () => {
    it('should connect to the test database and execute a simple query', async () => {
        const result = await sql`SELECT 1 as number`;
        expect(result[0].number).toBe(1);
    });

    afterAll(async () => {
        await sql.end();
    });
});