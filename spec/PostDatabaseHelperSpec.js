const faker = require('faker');

const pool = require('../src/database/connection');
const PostHelper = require('../src/database/post');
const UserHelper = require('../src/database/user');
const { generateUserData, getRandomImageFixture } = require('./seeder');

describe('PostHelper', () => {
  const postHelper = new PostHelper(pool);
  const userHelper = new UserHelper(pool);

  beforeEach(async () => {
    postHelper.deleteUploads();
    await postHelper.dropTables();
    await userHelper.dropTable();
    await userHelper.createTable();
    await postHelper.createTables();
  });

  it('should be able to create a GIF post', async () => {
    const seedData = generateUserData();

    const userInfo = await userHelper.createUser(seedData);
    const filePath = getRandomImageFixture();
    const title = faker.lorem.sentence();
    const gifInfo = await postHelper.createGIF(userInfo.id, filePath, title, false);

    expect(gifInfo.id).not.toBeNull();
    expect(gifInfo.id).toBeDefined();
    expect(gifInfo.post_type).toBe('GIF');
    expect(gifInfo.body).toBe('');
    expect(gifInfo.public_id).not.toBeNull();
    expect(gifInfo.public_id).toBeDefined();
    expect(gifInfo.url).not.toBeNull();
    expect(gifInfo.url).toBeDefined();
  });

  it('should be able to create an article', async () => {
    const seedData = generateUserData();
    const title = faker.lorem.sentence();
    const body = faker.lorem.sentences(5);

    const userInfo = await userHelper.createUser(seedData);
    const articleInfo = await postHelper.createArticle(userInfo.id, title, body);

    expect(articleInfo.id).not.toBeNull();
    expect(articleInfo.id).toBeDefined();
    expect(articleInfo.post_type).toBe('Article');
    expect(articleInfo.public_id).toBe('');
    expect(articleInfo.url).toBe('');
    expect(articleInfo.title).toBe(title);
    expect(articleInfo.body).toBe(body);
  });

  it('should be able to update an article', async () => {
    const seedData = generateUserData();
    const seedData2 = generateUserData();
    const title = faker.lorem.sentence();
    const body = faker.lorem.sentences(5);
    const newTitle = faker.lorem.sentence();
    const newBody = faker.lorem.sentences(5);
    const userInfo = await userHelper.createUser(seedData);
    const user2Info = await userHelper.createUser(seedData2);
    const articleInfo = await postHelper.createArticle(userInfo.id, title, body);
    let updatedInfo = await postHelper.updateArticle(
      user2Info.id,
      articleInfo.id,
      newTitle,
      newBody
    );

    expect(updatedInfo).toBe(null);

    updatedInfo = await postHelper.updateArticle(userInfo.id, articleInfo.id, newTitle, newBody);

    expect(updatedInfo.id).toBe(articleInfo.id);
    expect(updatedInfo.title).toBe(newTitle);
    expect(updatedInfo.body).toBe(newBody);
    expect(updatedInfo.updated_at).toBeGreaterThan(articleInfo.updated_at);
    expect(updatedInfo.created_at).toEqual(articleInfo.created_at);
  });

  it('should be able to create a comment', async () => {
    const user1Data = generateUserData();
    const user2Data = generateUserData();
    const uploadFile = getRandomImageFixture();
    const gifTitle = faker.lorem.sentence();
    const articleTitle = faker.lorem.sentence();
    const body = faker.lorem.sentences(10);
    const articleComment = faker.lorem.sentence();
    const gifComment = faker.lorem.sentence();
    const user1 = await userHelper.createUser(user1Data);
    const user2 = await userHelper.createUser(user2Data);

    const articleInfo = await postHelper.createArticle(user1.id, articleTitle, body);
    const gifInfo = await postHelper.createGIF(user2.id, uploadFile, gifTitle, false);

    const articleCommentInfo = await postHelper.createComment(
      user2.id,
      articleInfo.id,
      articleComment
    );
    const gifCommentInfo = await postHelper.createComment(user1.id, gifInfo.id, gifComment);

    expect(articleCommentInfo.post_id).toBe(articleInfo.id);
    expect(articleCommentInfo.author_id).toBe(user2.id);
    expect(articleCommentInfo.comment).toBe(articleComment);
    expect(gifCommentInfo.post_id).toBe(gifInfo.id);
    expect(gifCommentInfo.author_id).toBe(user1.id);
    expect(gifCommentInfo.comment).toBe(gifComment);
  });

  it('should be able to flag a post', async () => {
    const userData = generateUserData();
    const articleTitle = faker.lorem.sentence();
    const body = faker.lorem.sentences(10);

    const user = await userHelper.createUser(userData);

    const articleInfo = await postHelper.createArticle(user.id, articleTitle, body);
    const result = await postHelper.flagPost(articleInfo.id);

    expect(result).toBe(true);
  });

  it('should be able to flag a comment', async () => {
    const user1Data = generateUserData();
    const user2Data = generateUserData();
    const articleTitle = faker.lorem.sentence();
    const body = faker.lorem.sentences(10);
    const comment = faker.lorem.sentence();

    const user1 = await userHelper.createUser(user1Data);
    const user2 = await userHelper.createUser(user2Data);

    const articleInfo = await postHelper.createArticle(user1.id, articleTitle, body);
    const commentInfo = await postHelper.createComment(user2.id, articleInfo.id, comment);
    const result = await postHelper.flagComment(commentInfo.id);

    expect(result).toBe(true);
  });

  it('should be able to delete a post', async () => {
    const user1Data = generateUserData();
    const user2Data = generateUserData();
    const user1 = await userHelper.createUser(user1Data);
    const user2 = await userHelper.createUser(user2Data);
    const admin = await userHelper.createAdmin();
    const post1Title = faker.lorem.sentence();
    const post2Title = faker.lorem.sentence();
    const post1Body = faker.lorem.sentences(5);
    const filePath = getRandomImageFixture();

    const articleInfo = await postHelper.createArticle(user1.id, post1Title, post1Body);

    let result = await postHelper.deletePost(user2, articleInfo.id);
    expect(result).toBe(false);
    result = await postHelper.deletePost(user1, articleInfo.id);
    expect(result).toBe(true);

    const gifInfo = await postHelper.createGIF(user2.id, filePath, post2Title, false);
    result = await postHelper.deletePost(admin, gifInfo.id);
    expect(result).toBe(false);
    await postHelper.flagPost(gifInfo.id);
    result = await postHelper.deletePost(admin, gifInfo.id);
    expect(result).toBe(true);
  });

  it('should be able to delete a comment', async () => {
    const user1Data = generateUserData();
    const user2Data = generateUserData();
    const articleTitle = faker.lorem.sentence();
    const body = faker.lorem.sentences(10);
    const comment = faker.lorem.sentence();

    const user1 = await userHelper.createUser(user1Data);
    const user2 = await userHelper.createUser(user2Data);
    const admin = await userHelper.createAdmin();

    const articleInfo = await postHelper.createArticle(user1.id, articleTitle, body);
    const commentInfo = await postHelper.createComment(user2.id, articleInfo.id, comment);

    let result = await postHelper.deleteComment(user1, commentInfo.id);
    expect(result).toBe(false);
    result = await postHelper.deleteComment(admin, commentInfo.id);
    expect(result).toBe(false);
    await postHelper.flagComment(commentInfo.id);
    result = await postHelper.deleteComment(admin, commentInfo.id);
    expect(result).toBe(true);
  });
});
