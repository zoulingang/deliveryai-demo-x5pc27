import { test, expect, type Page } from '@playwright/test'

async function signIn(page: Page) {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /欢迎来到沸点|Welcome to Boiling Moment/ })).toBeVisible()
  await page.getByRole('button', { name: /登录并开始体验|Sign in and start/ }).click()
  await expect(page).toHaveURL(/#\/home$/)
}

async function seedSignedIn(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('demo-login', 'true')
  })
}

async function expectNoOverlap(first: ReturnType<Page['locator']>, second: ReturnType<Page['locator']>) {
  const firstBox = await first.boundingBox()
  const secondBox = await second.boundingBox()
  expect(firstBox).not.toBeNull()
  expect(secondBox).not.toBeNull()
  const separated =
    firstBox!.x + firstBox!.width <= secondBox!.x ||
    secondBox!.x + secondBox!.width <= firstBox!.x ||
    firstBox!.y + firstBox!.height <= secondBox!.y ||
    secondBox!.y + secondBox!.height <= firstBox!.y
  expect(separated).toBeTruthy()
}

/** 从首页绑定 A08 桌台并进入点餐视图（menu）。 */
async function enterMenu(page: Page) {
  await signIn(page)
  await page.getByRole('button', { name: /A08/ }).first().click() // home → welcome
  await page.getByRole('button', { name: /进入点餐|Enter/ }).click() // welcome → menu
}

test.describe('视图 URL 路由 - hash 模式', () => {
  test('REQ-001: 未登录访问首页先展示登录欢迎页', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/#\/login$/)
    await expect(page.getByRole('heading', { name: /欢迎来到沸点|Welcome to Boiling Moment/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /登录并开始体验|Sign in and start/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /注册|找回密码|第三方|Register|Sign up|Forgot|Google|Facebook/ })).toHaveCount(0)
  })

  test('REQ-002: 点击登录后进入既有桌台绑定首页', async ({ page }) => {
    await signIn(page)
    await expect(page.getByRole('button', { name: /A08/ }).first()).toBeVisible()
  })

  test('REQ-003: 已登录访问根入口跳过登录欢迎页', async ({ page }) => {
    await seedSignedIn(page)
    await page.goto('/')
    await expect(page).toHaveURL(/#\/home$/)
    await expect(page.getByRole('heading', { name: /欢迎来到沸点|Welcome to Boiling Moment/ })).not.toBeVisible()
    await expect(page.getByRole('button', { name: /A08/ }).first()).toBeVisible()
  })

  test('REQ-004: 登录处理中主入口展示 loading 并禁用重复点击', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /登录并开始体验|Sign in and start/ }).click()
    const loadingButton = page.getByRole('button', { name: /正在进入|Signing in/ })
    await expect(loadingButton).toBeVisible()
    await expect(loadingButton).toBeDisabled()
    await expect(page).toHaveURL(/#\/home$/)
  })

  test('REQ-005: 英文环境展示登录欢迎页文案并可继续登录', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('i18nextLng', 'en')
    })
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.getByRole('heading', { name: 'Welcome to Boiling Moment' })).toBeVisible()
    await expect(page.getByText('Sign in to continue the table ordering and store fulfillment demo.')).toBeVisible()
    await page.getByRole('button', { name: 'Sign in and start' }).click()
    await expect(page).toHaveURL(/#\/home$/)
  })

  test('REQ-005: 移动端登录欢迎页首屏内容可读且主入口可点击', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    const title = page.getByRole('heading', { name: /欢迎来到沸点|Welcome to Boiling Moment/ })
    const desc = page.getByText(/登录后继续体验桌台绑定、协同点餐与门店履约流程|Sign in to continue the table ordering/)
    const action = page.getByRole('button', { name: /登录并开始体验|Sign in and start/ })
    await expect(title).toBeVisible()
    await expect(desc).toBeVisible()
    await expect(action).toBeVisible()
    await expectNoOverlap(title, desc)
    await expectNoOverlap(desc, action)
    await action.click()
    await expect(page).toHaveURL(/#\/home$/)
  })

  test('ROUTE-002: 主流程各视图拥有独立地址', async ({ page }) => {
    await signIn(page)
    await page.getByRole('button', { name: /A08/ }).first().click()
    await expect(page).toHaveURL(/#\/welcome$/)
    await page.getByRole('button', { name: /进入点餐|Enter/ }).click()
    await expect(page).toHaveURL(/#\/menu$/)
  })

  test('ROUTE-003: 顶栏导航切换地址（menu ↔ order）', async ({ page }) => {
    await enterMenu(page)
    await page.getByRole('button', { name: /订单|Orders/ }).first().click()
    await expect(page).toHaveURL(/#\/order$/)
    await page.getByRole('button', { name: /点餐|Menu/ }).first().click()
    await expect(page).toHaveURL(/#\/menu$/)
  })

  test('ROUTE-004: 浏览器后退回到上一视图', async ({ page }) => {
    await enterMenu(page)
    await page.getByRole('button', { name: /订单|Orders/ }).first().click()
    await expect(page).toHaveURL(/#\/order$/)
    await page.goBack()
    await expect(page).toHaveURL(/#\/menu$/)
    await expect(page.getByRole('heading', { name: '鎏金番茄鸳鸯锅' })).toBeVisible()
  })

  test('ROUTE-005: 未登录深链接先登录，登录后回到 #/menu', async ({ page }) => {
    await page.goto('/#/menu')
    await expect(page).toHaveURL(/#\/login$/)
    await page.getByRole('button', { name: /登录并开始体验|Sign in and start/ }).click()
    await expect(page).toHaveURL(/#\/menu$/)
    await expect(page.getByRole('heading', { name: '鎏金番茄鸳鸯锅' })).toBeVisible()
  })

  test('ROUTE-006: 已登录深链接直达 #/menu（自动绑定示例桌台）', async ({ page }) => {
    await seedSignedIn(page)
    await page.goto('/#/menu')
    await expect(page).toHaveURL(/#\/menu$/)
    await expect(page.getByRole('heading', { name: '鎏金番茄鸳鸯锅' })).toBeVisible()
  })

  test('ROUTE-007: 未登录非法地址回落到登录欢迎页 #/login', async ({ page }) => {
    await page.goto('/#/not-a-view')
    await expect(page).toHaveURL(/#\/login$/)
    await expect(page.getByRole('button', { name: /登录并开始体验|Sign in and start/ })).toBeVisible()
  })

  test('ROUTE-008: 已登录非法地址回落到首页 #/home', async ({ page }) => {
    await seedSignedIn(page)
    await page.goto('/#/not-a-view')
    await expect(page).toHaveURL(/#\/home$/)
    await expect(page.getByRole('button', { name: /A08/ }).first()).toBeVisible()
  })
})
