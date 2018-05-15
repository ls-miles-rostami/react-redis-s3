const Page = require('./helpers/page');

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto('http://localhost:3000');
});

afterEach(async () => {
  await page.close();
});

describe('When logged in', async () => {
  beforeEach(async () => {
    await page.login();
    await page.click('a.btn-floating');
  });
  test('Can see blog create form', async () => {
    const label = await page.getContentsOf('form label');
    expect(label).toEqual('Blog Title');
  });
  describe('When logged in and using valid inputs', async () => {
    beforeEach(async () => {
      await page.type('.title input', 'My test title');
      await page.type('.content input', 'My test content');
      await page.click('form button');
    });
    test('Submitting takes user to review screen', async () => {
      const text = await page.getContentsOf('h5');
      expect(text).toEqual('Please confirm your entries');
    });
    test('Submitting then saving add blog to index page', async () => {
      await page.click('button.green');
      await page.waitFor('.card');
      const title = await page.getContentsOf('.card-title');
      const content = await page.getContentsOf('p');
      expect(title).toEqual('My test title');
      expect(content).toEqual('My test content');
    });
  });
  describe('When logged in and using invalid inputs', async () => {
    beforeEach(async () => {
      await page.click('form button');
    });
    test('The form shows an error message', async () => {
      const titleError = await page.getContentsOf('.title .red-text');
      const contentError = await page.getContentsOf('.content .red-text');
      expect(titleError).toEqual('You must provide a value');
      expect(contentError).toEqual('You must provide a value');
    });
  });
});

describe('User is not logged in', async () => {
  test('User cant create a blog post', async () => {
    //note that when you want to use evaluate, you must enclose your function, in this case a fetch, inside of another function so that jest can send it to chromium and not evalulate it itself.
    const result = await page.evaluate(() => {
      return fetch('http://localhost:3000/api/blogs', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'This is from the console',
          content: 'this content is from the console as well.'
        })
      }).then(res => res.json());
    });

    expect(result).toEqual({ error: 'You must log in!' });
  });

  test('User cannot get list of blog posts', async () => {
    const result = await page.evaluate(() => {
      return fetch('http://localhost:3000/api/blogs', {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => res.json());
    });
    expect(result).toEqual({ error: 'You must log in!' });
  });
});
