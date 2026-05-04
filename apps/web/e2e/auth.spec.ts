import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  const nationalId = '012345678901';

  test('should login, perform actions, logout and deny re-access', async ({ page }) => {
    // 1. Navigate to Login Page
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText('Đăng nhập hệ thống');

    // 2. Enter National ID (CCCD)
    await page.fill('input[placeholder*="12 chữ số"]', nationalId);
    
    // Intercept the login request to capture the mock OTP from the sandbox
    const loginResponsePromise = page.waitForResponse(response => 
      response.url().includes('/api/v1/auth/login') && response.status() === 201
    );

    // Click Continue
    await page.click('button:has-text("Tiếp tục")');

    // Get the OTP from the response
    const loginResponse = await loginResponsePromise;
    const responseBody = await loginResponse.json();
    const otp = responseBody._testOtp;

    if (!otp) {
      throw new Error('Test OTP not found in the login response. Ensure the sandbox is in development mode.');
    }

    console.log(`Captured test OTP: ${otp}`);

    // 3. Verify OTP Page
    await expect(page).toHaveURL(/\/auth_otp/);
    await expect(page.locator('h1')).toContainText('Xác thực mã OTP');

    // 4. Enter OTP digits
    const otpDigits = otp.split('');
    for (let i = 0; i < otpDigits.length; i++) {
      await page.locator(`input[aria-label="Nhập số OTP thứ ${i + 1}"]`).fill(otpDigits[i]);
    }

    // Click Confirm
    await page.click('button:has-text("Xác nhận")');

    // 5. Verify Dashboard redirection
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('h1')).toContainText('Quản lý Hồ sơ Đất đai');

    // 6. Thao tác: Navigate to Wallet page
    await page.click('button:has-text("Check Wallet")');
    await expect(page).toHaveURL(/\/wallet/);
    
    // Go back to dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);

    // 7. Logout
    await page.click('button[title="Đăng xuất"]');
    
    // Verify redirection to home or login (based on router.push("/"))
    await expect(page).toHaveURL('/');

    // 8. Try to access secured URL again
    await page.goto('/dashboard');
    
    // Should be redirected back to login because the token is gone
    await expect(page).toHaveURL(/\/login/);
  });

  test('should revoke access after 15 minutes of inactivity', async ({ page }) => {
    // 1. Navigate to Login Page
    await page.goto('/login');
    
    // 2. Enter National ID (CCCD)
    await page.fill('input[placeholder*="12 chữ số"]', nationalId);
    
    // Intercept the login request to capture the mock OTP
    const loginResponsePromise = page.waitForResponse(response => 
      response.url().includes('/api/v1/auth/login') && response.status() === 201
    );

    await page.click('button:has-text("Tiếp tục")');
    const loginResponse = await loginResponsePromise;
    const responseBody = await loginResponse.json();
    const otp = responseBody._testOtp;

    if (!otp) {
      throw new Error('Test OTP not found.');
    }

    // 3. Enter OTP digits
    const otpDigits = otp.split('');
    for (let i = 0; i < otpDigits.length; i++) {
      await page.locator(`input[aria-label="Nhập số OTP thứ ${i + 1}"]`).fill(otpDigits[i]);
    }

    await page.click('button:has-text("Xác nhận")');

    // 4. Verify Dashboard redirection
    await expect(page).toHaveURL(/\/dashboard/);

    // 5. Giả lập không có thao tác trong 15 phút
    // Cài đặt đồng hồ của Playwright để có thể tua nhanh thời gian
    await page.clock.install();
    await page.clock.fastForward('15:00'); // Tua đi 15 phút

    // Giả lập backend trả về 401 khi token đã hết hạn
    // Vì backend thật không bị ảnh hưởng bởi đồng hồ giả lập của Playwright,
    // ta cần mock response cho các request API tiếp theo
    await page.route('**/api/v1/**', route => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ statusCode: 401, message: 'Unauthorized' })
      });
    });

    // 6. Thực hiện một thao tác bất kỳ sau 15 phút (vd: xem ví)
    // Hành động này sẽ gọi API và nhận về 401
    await page.click('button:has-text("Check Wallet")');

    // 7. Hệ thống phải thực thi lệnh thu hồi quyền và đẩy về trang đăng nhập
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('h1')).toContainText('Đăng nhập hệ thống');
  });
});
