const { test } = require('node:test');
const assert = require('node:assert/strict');
const { ContentService } = require('../dist/modules/content/content.service');
const { AdminGuard, createAdminToken } = require('../dist/modules/auth/admin.guard');
const { localized, localizedResponse } = require('../dist/common/i18n/localization');
const { contactSchema } = require('../dist/modules/site/site.schemas');

test('translations require all three languages and can be selected', () => {
  const value = { tk: 'Salam', ru: 'Привет', en: 'Hello' };
  assert.equal(localized.safeParse(value).success, true);
  assert.equal(localized.safeParse({ ru: 'Привет', en: 'Hello' }).success, false);
  assert.deepEqual(localizedResponse({ title: value }, 'ru'), { title: 'Привет' });
});

test('company contacts accept a Telegram phone number', () => {
  const contact = {
    email: 'info@example.com', phone: '+99360000000', whatsapp: '+99360000000',
    telegramPhone: '+99361111111', address: { tk: 'Aşgabat', ru: 'Ашхабад', en: 'Ashgabat' },
  };
  assert.equal(contactSchema.safeParse(contact).success, true);
  assert.equal(contactSchema.safeParse({ ...contact, telegramPhone: '' }).success, false);
});

test('category tree counts products in descendants', async () => {
  const prisma = {
    category: { findMany: async () => [
      { id: 'a', parentId: null, slug: 'main', title: { tk: 'a', ru: 'a', en: 'a' } },
      { id: 'b', parentId: 'a', slug: 'sub', title: { tk: 'b', ru: 'b', en: 'b' } },
    ] },
    product: { groupBy: async () => [{ categoryId: 'b', _count: { _all: 3 } }] },
  };
  const [root] = await new ContentService(prisma).tree();
  assert.equal(root.productCount, 3);
  assert.equal(root.children[0].directProductCount, 3);
});

test('product filter includes descendant categories', async () => {
  let captured;
  const prisma = {
    category: { findMany: async () => [
      { id: 'a', slug: 'main', parentId: null },
      { id: 'b', slug: 'sub', parentId: 'a' },
      { id: 'c', slug: 'leaf', parentId: 'b' },
    ] },
    product: {
      findMany: async (options) => { captured = options; return []; },
      count: async () => 0,
    },
  };
  await new ContentService(prisma).list('products', { categorySlug: 'main' });
  assert.deepEqual(captured.where.categoryId.in, ['a', 'b', 'c']);
});

test('catalog list sorts by an existing Catalog field', async () => {
  let captured;
  const prisma = {
    catalog: {
      findMany: async (options) => { captured = options; return []; },
      count: async () => 0,
    },
  };
  await new ContentService(prisma).list('catalogs', {});
  assert.deepEqual(captured.orderBy, { updatedAt: 'desc' });
});

test('admin bearer token is signed and rejects tampering', () => {
  process.env.ADMIN_API_KEY = 'a-long-test-secret';
  const guard = new AdminGuard();
  const check = (token) => guard.canActivate({ switchToHttp: () => ({ getRequest: () => ({ headers: { authorization: `Bearer ${token}` } }) }) });
  const token = createAdminToken(process.env.ADMIN_API_KEY);
  assert.equal(check(token), true);
  assert.throws(() => check(`${token}x`));
});
