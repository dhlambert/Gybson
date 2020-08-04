import { buildMySQLSchema, closeConnection, connection } from '../Setup/buildMySQL';
import gybInit, { LogLevel } from '../../src/Client';
import gybsonRefresh, { Gybson } from '../Gen';
import { seed, SeedIds, seedPost, seedUser } from '../Setup/seed';
import 'jest-extended';

describe('FindMany', () => {
    let ids: SeedIds;
    let gybson: Gybson;
    beforeAll(
        async (): Promise<void> => {
            await buildMySQLSchema();
            await gybInit.init({ ...connection, options: { logLevel: LogLevel.debug } });
        },
    );
    afterAll(async () => {
        await closeConnection();
        await gybInit.close();
    });
    beforeEach(async () => {
        gybson = gybsonRefresh();

        // Seeds
        ids = await seed(gybson);
    });
    describe('usage', () => {
        it('loads many rows', async () => {
            const posts = await gybson.Posts.findMany({});
            expect(posts.length).toBeGreaterThan(1);
        });
        it('does not load deleted rows by default', async () => {
            await gybson.Posts.softDelete({
                where: {
                    post_id: ids.post1Id,
                },
            });
            const posts = await gybson.Posts.findMany({});
            expect(posts).not.toContainEqual(expect.objectContaining({ post_id: ids.post1Id }));
        });
    });
    describe('where', () => {
        describe('Column filters', () => {
            it('Can filter by column equals', async () => {
                const find = await gybson.Users.findMany({
                    where: {
                        user_id: ids.user1Id,
                    },
                });
                expect(find).toHaveLength(1);
                expect(find).toContainEqual(
                    expect.objectContaining({
                        user_id: ids.user1Id,
                    }),
                );
            });
            it('Can filter by column equals (other syntax)', async () => {
                const find = await gybson.Users.findMany({
                    where: {
                        user_id: {
                            equals: ids.user1Id,
                        },
                    },
                });
                expect(find).toHaveLength(1);
                expect(find).toContainEqual(
                    expect.objectContaining({
                        user_id: ids.user1Id,
                    }),
                );
            });
            it('Can filter by column not equals', async () => {
                const find = await gybson.Users.findMany({
                    where: {
                        user_id: {
                            not: ids.user1Id,
                        },
                    },
                });
                expect(find).not.toContainEqual(
                    expect.objectContaining({
                        user_id: ids.user1Id,
                    }),
                );
            });
            it('Can filter by column in', async () => {
                const user2Id = await seedUser(gybson);
                const find = await gybson.Users.findMany({
                    where: {
                        user_id: {
                            in: [ids.user1Id, user2Id],
                        },
                    },
                });
                expect(find).toHaveLength(2);
                expect(find).toIncludeAllMembers([
                    expect.objectContaining({
                        user_id: ids.user1Id,
                    }),
                    expect.objectContaining({
                        user_id: user2Id,
                    }),
                ]);
            });
            it('Can filter by column not in', async () => {
                const user2Id = await seedUser(gybson);
                const find = await gybson.Users.findMany({
                    where: {
                        user_id: {
                            notIn: [ids.user1Id, user2Id],
                        },
                    },
                });
                expect(find).not.toIncludeAnyMembers([
                    expect.objectContaining({
                        user_id: ids.user1Id,
                    }),
                    expect.objectContaining({
                        user_id: user2Id,
                    }),
                ]);
            });
            it('Can filter by greater than', async () => {
                const find = await gybson.Posts.findMany({
                    where: {
                        rating_average: {
                            gt: 4.5,
                        },
                    },
                });
                expect(find).toContainEqual(
                    expect.objectContaining({
                        post_id: ids.post2Id,
                    }),
                );
                expect(find).not.toContainEqual(
                    expect.objectContaining({
                        post_id: ids.post1Id,
                    }),
                );
            });
            it('Can filter by greater than or equal', async () => {
                const find = await gybson.Posts.findMany({
                    where: {
                        rating_average: {
                            gte: 6,
                        },
                    },
                });
                expect(find).toContainEqual(
                    expect.objectContaining({
                        post_id: ids.post2Id,
                    }),
                );
                expect(find).not.toContainEqual(
                    expect.objectContaining({
                        post_id: ids.post1Id,
                    }),
                );
            });
            it('Can filter by less than', async () => {
                const find = await gybson.Posts.findMany({
                    where: {
                        rating_average: {
                            lt: 4.5,
                        },
                    },
                });
                expect(find).toHaveLength(0);
            });
            it('Can filter by less than or equal', async () => {
                const find = await gybson.Posts.findMany({
                    where: {
                        rating_average: {
                            lte: 4.5,
                        },
                    },
                });
                expect(find).toContainEqual(
                    expect.objectContaining({
                        post_id: ids.post1Id,
                    }),
                );
                expect(find).not.toContainEqual(
                    expect.objectContaining({
                        post_id: ids.post2Id,
                    }),
                );
            });
            it('Can filter by string contains', async () => {
                const find = await gybson.Posts.findMany({
                    where: {
                        message: {
                            contains: 'est',
                        },
                    },
                });
                expect(find).toContainEqual(
                    expect.objectContaining({
                        post_id: ids.post2Id,
                    }),
                );
                expect(find).not.toContainEqual(
                    expect.objectContaining({
                        post_id: ids.post1Id,
                    }),
                );
            });
            it('Can filter by string starts with', async () => {
                const find = await gybson.Posts.findMany({
                    where: {
                        message: {
                            startsWith: 'fi',
                        },
                    },
                });
                expect(find).toContainEqual(
                    expect.objectContaining({
                        post_id: ids.post1Id,
                    }),
                );
                expect(find).not.toContainEqual(
                    expect.objectContaining({
                        post_id: ids.post2Id,
                    }),
                );
            });
            it('Can filter by string ends with', async () => {
                const find = await gybson.Posts.findMany({
                    where: {
                        message: {
                            endsWith: '2',
                        },
                    },
                });
                expect(find).toContainEqual(
                    expect.objectContaining({
                        post_id: ids.post2Id,
                    }),
                );
                expect(find).not.toContainEqual(
                    expect.objectContaining({
                        post_id: ids.post1Id,
                    }),
                );
            });
        });
        describe('Column types filters', () => {
            it('Can filter strings', async () => {
                const find = await gybson.Posts.findMany({
                    where: {
                        message: {
                            equals: 'test 2',
                            startsWith: 'tes',
                            endsWith: '2',
                        },
                        author: {
                            lt: 'owen',
                            gte: 'andy',
                        },
                    },
                });
                expect(find).toContainEqual(
                    expect.objectContaining({
                        post_id: ids.post2Id,
                        author: 'name',
                    }),
                );
            });
            it('Can filter numbers', async () => {
                const find = await gybson.Posts.findMany({
                    where: {
                        rating_average: {
                            equals: 4,
                            lt: 5,
                            gt: 3,
                            not: 7,
                        },
                    },
                });
                expect(find).toHaveLength(0);
            });
            it('Can filter dates', async () => {
                const p3 = await seedPost(gybson, { author_id: ids.user1Id, created: new Date(2009, 4) });
                const find = await gybson.Posts.findMany({
                    where: {
                        created: {
                            lt: new Date(),
                            gt: new Date(2005, 5, 2),
                        },
                    },
                });
                expect(find).toContainEqual(
                    expect.objectContaining({
                        post_id: p3,
                    }),
                );
                expect(find).not.toContainEqual(
                    expect.objectContaining({
                        post_id: ids.post2Id,
                    }),
                );
            });
            it('Can filter booleans', async () => {
                await gybson.TeamMembersPositions.insert({
                    values: {
                        team_id: ids.team1Id,
                        user_id: ids.user1Id,
                        verified: true,
                        position: 'pos',
                        manager: 'a manager',
                    },
                });
                const find = await gybson.TeamMembersPositions.findMany({
                    where: {
                        verified: true,
                    },
                });
                expect(find).toContainEqual(
                    expect.objectContaining({
                        team_id: ids.team1Id,
                        user_id: ids.user1Id,
                        verified: 1,
                    }),
                );
            });
        });
        describe('Multiple column filters', () => {
            it('Can filter by multiple columns', async () => {
                const find = await gybson.Posts.findMany({
                    where: {
                        author: {
                            equals: 'name',
                        },
                        rating_average: 6,
                    },
                });
                expect(find).toContainEqual(
                    expect.objectContaining({
                        post_id: ids.post2Id,
                    }),
                );
                expect(find).toContainEqual(
                    expect.not.objectContaining({
                        post_id: ids.post1Id,
                    }),
                );
            });
            it('Can filter by multiple columns', async () => {
                await gybson.Users.findMany({
                    where: {
                        permissions: 'USER',
                        first_name: {
                            startsWith: 'john',
                            endsWith: 'n',
                        },
                        token: {
                            not: null,
                        },
                        subscription_level: 'GOLD',
                        best_friend_id: {
                            in: [5, 6],
                        },
                    },
                });
            });
        });
        describe('Relation filters', () => {
            it('Can filter by where every related row meets a condition', async () => {
                const u2 = await seedUser(gybson);
                await seedPost(gybson, { author_id: u2, message: 'filter-me' });
                await seedPost(gybson, { author_id: u2, message: 'nope' });
                // both posts meet the condition
                const users = await gybson.Users.findMany({
                    where: {
                        author_posts: {
                            whereEvery: {
                                message: {
                                    contains: 'e',
                                },
                            },
                        },
                    },
                });
                expect(users).toContainEqual(
                    expect.objectContaining({
                        user_id: u2,
                    }),
                );
                // tighten the condition so only one post meets it
                const users2 = await gybson.Users.findMany({
                    where: {
                        author_posts: {
                            whereEvery: {
                                message: {
                                    contains: 'me',
                                },
                            },
                        },
                    },
                });
                expect(users2).not.toContainEqual(
                    expect.objectContaining({
                        user_id: u2,
                    }),
                );
            });
            it('Can filter by exists', async () => {
                const u2 = await seedUser(gybson);
                await seedPost(gybson, { author_id: u2, message: 'filter-me' });
                await seedPost(gybson, { author_id: u2, message: 'not' });
                const users = await gybson.Users.findMany({
                    where: {
                        author_posts: {
                            existsWhere: {
                                message: {
                                    contains: 'filter-m',
                                },
                            },
                        },
                    },
                });
                expect(users).toContainEqual(
                    expect.objectContaining({
                        user_id: u2,
                    }),
                );
                expect(users).not.toContainEqual(
                    expect.objectContaining({
                        user_id: ids.user1Id,
                    }),
                );
            });
            it('Can filter by not exists', async () => {
                const u2 = await seedUser(gybson);
                await seedPost(gybson, { author_id: u2, message: 'filter-me' });
                await seedPost(gybson, { author_id: u2, message: 'not' });
                const users = await gybson.Users.findMany({
                    where: {
                        author_posts: {
                            notExistsWhere: {
                                message: {
                                    contains: 'filter-m',
                                },
                            },
                        },
                    },
                });
                expect(users).not.toContainEqual(
                    expect.objectContaining({
                        user_id: u2,
                    }),
                );
                expect(users).toContainEqual(
                    expect.objectContaining({
                        user_id: ids.user1Id,
                    }),
                );
            });
        });
        describe('Combiners (gates)', () => {
            it('Can combine clauses with AND', async () => {
                const p1 = await seedPost(gybson, { message: 'happy', author_id: ids.user1Id, rating_average: 8 });
                const p2 = await seedPost(gybson, { message: 'happy', author_id: ids.user1Id, rating_average: 3 });
                const find = await gybson.Posts.findMany({
                    where: {
                        AND: [
                            {
                                message: {
                                    contains: 'happy',
                                },
                            },
                            {
                                rating_average: {
                                    gt: 5,
                                },
                            },
                        ],
                    },
                });
                expect(find).toContainEqual(
                    expect.objectContaining({
                        post_id: p1,
                    }),
                );
                expect(find).not.toContainEqual(
                    expect.objectContaining({
                        post_id: p2,
                    }),
                );
            });
            it('Can combine clauses with OR', async () => {
                const p1 = await seedPost(gybson, { message: 'happy', author_id: ids.user1Id, rating_average: 8 });
                const p2 = await seedPost(gybson, { message: 'hip', author_id: ids.user1Id, rating_average: 3 });
                const find = await gybson.Posts.findMany({
                    where: {
                        OR: [
                            {
                                message: {
                                    contains: 'hip',
                                },
                            },
                            {
                                rating_average: {
                                    gt: 5,
                                },
                            },
                        ],
                    },
                });
                expect(find).toContainEqual(
                    expect.objectContaining({
                        post_id: p1,
                    }),
                );
                expect(find).toContainEqual(
                    expect.objectContaining({
                        post_id: p2,
                    }),
                );
            });
            it('Can combine clauses with NOT', async () => {
                const p1 = await seedPost(gybson, { message: 'happy', author_id: ids.user1Id, rating_average: 8 });
                const p2 = await seedPost(gybson, { message: 'hip', author_id: ids.user1Id, rating_average: 3 });
                const find = await gybson.Posts.findMany({
                    where: {
                        NOT: [
                            {
                                message: {
                                    contains: 'hip',
                                },
                            },
                            {
                                rating_average: {
                                    gt: 5,
                                },
                            },
                        ],
                    },
                });
                expect(find).not.toContainEqual(
                    expect.objectContaining({
                        post_id: p1,
                    }),
                );
                expect(find).not.toContainEqual(
                    expect.objectContaining({
                        post_id: p2,
                    }),
                );
            });
            it('Can combine more than 2 clauses', async () => {
                const p1 = await seedPost(gybson, { message: 'happy', author_id: ids.user1Id, rating_average: 8 });
                const p2 = await seedPost(gybson, { message: 'hip', author_id: ids.user1Id, rating_average: 3 });
                const find = await gybson.Posts.findMany({
                    where: {
                        AND: [
                            {
                                message: {
                                    contains: 'hap',
                                },
                            },
                            {
                                rating_average: {
                                    gt: 5,
                                },
                            },
                            {
                                post_id: {
                                    not: p2,
                                },
                            },
                        ],
                    },
                });
                expect(find).toContainEqual(
                    expect.objectContaining({
                        post_id: p1,
                    }),
                );
                expect(find).not.toContainEqual(
                    expect.objectContaining({
                        post_id: p2,
                    }),
                );
            });
            it('Can nest combiners', async () => {
                const p1 = await seedPost(gybson, { message: 'happy', author_id: ids.user1Id, rating_average: 8 });
                const p2 = await seedPost(gybson, { message: 'hip', author_id: ids.user1Id, rating_average: 3 });
                const find = await gybson.Posts.findMany({
                    where: {
                        OR: [
                            {
                                AND: [
                                    {
                                        message: {
                                            contains: 'hip',
                                        },
                                    },
                                    {
                                        author_id: {
                                            not: ids.user1Id,
                                        },
                                    },
                                ],
                            },
                            {
                                rating_average: {
                                    gt: 10,
                                },
                            },
                        ],
                    },
                });
                expect(find).not.toContainEqual(
                    expect.objectContaining({
                        post_id: p1,
                    }),
                );
                expect(find).not.toContainEqual(
                    expect.objectContaining({
                        post_id: p2,
                    }),
                );
            });
        });
        it('Can nest clauses', async () => {
            const p1 = await seedPost(gybson, { message: 'happy', author_id: ids.user1Id, rating_average: 8 });
            const p2 = await seedPost(gybson, { message: 'hip', author_id: ids.user1Id, rating_average: 3 });
            const p3 = await seedPost(gybson, { message: 'hipper', author_id: ids.user1Id, rating_average: 5 });
            const find = await gybson.Posts.findMany({
                where: {
                    OR: [
                        {
                            AND: [
                                {
                                    message: {
                                        contains: 'hip',
                                    },
                                    author_: {
                                        notExistsWhere: {
                                            first_name: 'steve',
                                        },
                                    },
                                },
                                {
                                    author_id: {
                                        not: ids.user1Id,
                                    },
                                },
                            ],
                        },
                        {
                            rating_average: {
                                gt: 10,
                            },
                            NOT: [
                                {
                                    created: {
                                        gt: new Date(),
                                    },
                                },
                            ],
                        },
                    ],
                },
            });
        });
    });
    describe('order by', () => {
        it('Can order loaded rows ascending', async () => {
            const u = await seedUser(gybson);
            const p1 = await seedPost(gybson, { author_id: u, message: 'z' });
            const p2 = await seedPost(gybson, { author_id: u, message: 'a' });
            const member = await gybson.Posts.findMany({
                where: {
                    author_id: u,
                },
                orderBy: {
                    message: 'asc',
                },
            });
            expect(member).toEqual([
                expect.objectContaining({
                    post_id: p2,
                }),
                expect.objectContaining({
                    post_id: p1,
                }),
            ]);
        });
        it('Can order loaded rows descending', async () => {
            const u = await seedUser(gybson);
            const p1 = await seedPost(gybson, { author_id: u, message: 'z' });
            const p2 = await seedPost(gybson, { author_id: u, message: 'a' });
            const member = await gybson.Posts.findMany({
                where: {
                    author_id: u,
                },
                orderBy: {
                    message: 'desc',
                },
            });
            expect(member).toEqual([
                expect.objectContaining({
                    post_id: p1,
                }),
                expect.objectContaining({
                    post_id: p2,
                }),
            ]);
        });
        it('Can order loaded rows by multiple columns', async () => {
            const u = await seedUser(gybson);
            const p1 = await seedPost(gybson, { author_id: u, message: 'a', author: 'c' });
            const p2 = await seedPost(gybson, { author_id: u, message: 'a', author: 'b' });
            const member = await gybson.Posts.findMany({
                where: {
                    author_id: u,
                },
                orderBy: {
                    message: 'asc',
                    author: 'desc',
                },
            });
            expect(member).toEqual([
                expect.objectContaining({
                    post_id: p1,
                }),
                expect.objectContaining({
                    post_id: p2,
                }),
            ]);
        });
    });
    describe('paginate', () => {
        it('Can paginate rows by offset limit', async () => {
            const u = await seedUser(gybson);
            const p1 = await seedPost(gybson, { author_id: u, message: 'a', author: 'c' });
            const p2 = await seedPost(gybson, { author_id: u, message: 'b', author: 'b' });
            const p3 = await seedPost(gybson, { author_id: u, message: 'c', author: 'b' });
            const posts = await gybson.Posts.findMany({
                where: {
                    author_id: u,
                },
                orderBy: {
                    message: 'asc',
                },
                paginate: {
                    offset: 1,
                    limit: 1,
                },
            });
            expect(posts).toHaveLength(1);
            expect(posts).toEqual([
                expect.objectContaining({
                    post_id: p2,
                }),
            ]);
        });
        it('Can paginate rows by forward cursor', async () => {
            const u = await seedUser(gybson);
            const p1 = await seedPost(gybson, { author_id: u, message: 'a', author: 'c' });
            const p2 = await seedPost(gybson, { author_id: u, message: 'b', author: 'b' });
            const p3 = await seedPost(gybson, { author_id: u, message: 'c', author: 'b' });
            const posts = await gybson.Posts.findMany({
                where: {
                    author_id: u,
                },
                orderBy: {
                    message: 'asc',
                },
                paginate: {
                    afterCursor: {
                        message: 'a',
                    },
                    limit: 2,
                },
            });
            expect(posts).toHaveLength(2);
            expect(posts).toEqual([
                expect.objectContaining({
                    post_id: p2,
                }),
                expect.objectContaining({
                    post_id: p3,
                }),
            ]);
        });
        it('Can paginate rows by backward cursor', async () => {
            const u = await seedUser(gybson);
            const p1 = await seedPost(gybson, { author_id: u, message: 'a', author: 'c' });
            const p2 = await seedPost(gybson, { author_id: u, message: 'b', author: 'b' });
            const p3 = await seedPost(gybson, { author_id: u, message: 'c', author: 'b' });
            const posts = await gybson.Posts.findMany({
                where: {
                    author_id: u,
                },
                orderBy: {
                    message: 'asc',
                },
                paginate: {
                    beforeCursor: {
                        message: 'c',
                    },
                    limit: 3,
                },
            });
            expect(posts).toHaveLength(2);
            expect(posts).toEqual([
                expect.objectContaining({
                    post_id: p1,
                }),
                expect.objectContaining({
                    post_id: p2,
                }),
            ]);
        });
        it('Can paginate rows by multi-part cursor', async () => {
            const u = await seedUser(gybson);
            const p1 = await seedPost(gybson, { author_id: u, message: 'a', author: 'a' });
            const p2 = await seedPost(gybson, { author_id: u, message: 'b', author: 'b' });
            const p3 = await seedPost(gybson, { author_id: u, message: 'c', author: 'b' });
            const posts = await gybson.Posts.findMany({
                where: {
                    author_id: u,
                },
                orderBy: {
                    message: 'asc',
                },
                paginate: {
                    beforeCursor: {
                        message: 'c',
                        author: 'b',
                    },
                    limit: 3,
                },
            });
            expect(posts).toHaveLength(1);
            expect(posts).toEqual([
                expect.objectContaining({
                    post_id: p1,
                }),
            ]);
        });
    });
});
