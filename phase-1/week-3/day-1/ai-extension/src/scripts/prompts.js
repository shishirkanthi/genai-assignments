/**
 * Collection of default prompts for different use cases (ICE POT Format)
 */
export const DEFAULT_PROMPTS = {
 
  /**
   * Selenium Java Page Object Prompt (No Test Class)
   */
  SELENIUM_JAVA_PAGE_ONLY: `
    Instructions:
    - Generate ONLY a Selenium Java Page Object Class (no test code).
    - Add JavaDoc for methods & class.
    - Use Selenium 2.30+ compatible imports.
    - Use meaningful method names.
    - Do NOT include explanations or test code.

    Context:
    DOM:
    \`\`\`html
    \${domContent}
    \`\`\`

    Example:
    \`\`\`java
    package com.testleaf.pages;

    /**
     * Page Object for Component Page
     */
    public class ComponentPage {
        // Add methods as per the DOM
    }
    \`\`\`

    Persona:
    - Audience: Automation engineer focusing on maintainable POM structure.

    Output Format:
    - A single Java class inside a \`\`\`java\`\`\` block.

    Tone:
    - Clean, maintainable, enterprise-ready.
  `,

  /**
   * Cucumber Feature File Only Prompt
   */
  CUCUMBER_ONLY: `
    Instructions:
    - Generate ONLY a Cucumber (.feature) file.
    - Use Scenario Outline with Examples table.
    - Make sure every step is relevant to the provided DOM.
    - Do not combine multiple actions into one step.
    - Use South India realistic dataset (names, addresses, pin codes, mobile numbers).
    - Use dropdown values only from provided DOM.
    - Generate multiple scenarios if applicable.

    Context:
    DOM:
    \`\`\`html
    \${domContent}
    \`\`\`

    Example:
    \`\`\`gherkin
    Feature: Login to OpenTaps

    Scenario Outline: Successful login with valid credentials
      Given I open the login page
      When I type "<username>" into the Username field
      And I type "<password>" into the Password field
      And I click the Login button
      Then I should be logged in successfully

    Examples:
      | username   | password  |
      | "testuser" | "testpass"|
      | "admin"    | "admin123"|
    \`\`\`

    Persona:
    - Audience: BDD testers who only need feature files.

    Output Format:
    - Only valid Gherkin in a \`\`\`gherkin\`\`\` block.

    Tone:
    - Clear, structured, executable.
  `,

  /**
   * Cucumber with Step Definitions
   */
  CUCUMBER_WITH_SELENIUM_JAVA_STEPS: `
    Instructions:
    - Generate BOTH:
      1. A Cucumber .feature file.
      2. A Java step definition class for selenium.
    - Do NOT include Page Object code.
    - Step defs must include WebDriver setup, explicit waits, and actual Selenium code.
    - Use Scenario Outline with Examples table (South India realistic data).

    Context:
    DOM:
    \`\`\`html
    \${domContent}
    \`\`\`
    URL: \${pageUrl}

    Example:
    \`\`\`gherkin
    Feature: Login to OpenTaps

    Scenario Outline: Successful login with valid credentials
      Given I open the login page
      When I type "<username>" into the Username field
      And I type "<password>" into the Password field
      And I click the Login button
      Then I should be logged in successfully

    Examples:
      | username   | password  |
\      | "admin"    | "admin123"|
    \`\`\`

    \`\`\`java
    package com.leaftaps.stepdefs;

    import io.cucumber.java.en.*;
    import org.openqa.selenium.*;
    import org.openqa.selenium.chrome.ChromeDriver;
    import org.openqa.selenium.support.ui.*;

    public class LoginStepDefinitions {
        private WebDriver driver;
        private WebDriverWait wait;

        @io.cucumber.java.Before
        public void setUp() {
            driver = new ChromeDriver();
            wait = new WebDriverWait(driver, Duration.ofSeconds(10));
            driver.manage().window().maximize();
        }

        @io.cucumber.java.After
        public void tearDown() {
            if (driver != null) driver.quit();
        }

        @Given("I open the login page")
        public void openLoginPage() {
            driver.get("\${pageUrl}");
        }

        @When("I type {string} into the Username field")
        public void enterUsername(String username) {
            WebElement el = wait.until(ExpectedConditions.elementToBeClickable(By.id("username")));
            el.sendKeys(username);
        }

        @When("I type {string} into the Password field")
        public void enterPassword(String password) {
            WebElement el = wait.until(ExpectedConditions.elementToBeClickable(By.id("password")));
            el.sendKeys(password);
        }

        @When("I click the Login button")
        public void clickLogin() {
            driver.findElement(By.xpath("//button[contains(text(),'Login')]")).click();
        }

        @Then("I should be logged in successfully")
        public void verifyLogin() {
            WebElement success = wait.until(ExpectedConditions.visibilityOfElementLocated(By.className("success")));
            assert success.isDisplayed();
        }
    }
    \`\`\`

    Persona:
    - Audience: QA engineers working with Cucumber & Selenium.

    Output Format:
    - Gherkin in \`\`\`gherkin\`\`\` block + Java code in \`\`\`java\`\`\` block.

    Tone:
    - Professional, executable, structured.
  `,

  /**
   * Playwright TypeScript Page Object Prompt (No Test Class)
   */
  PLAYWRIGHT_TS_PAGE_ONLY: `
    Instructions:
    - Generate ONLY a Playwright TypeScript Page Object Class (no test code).
    - Use TypeScript class-based Page Object Model.
    - Add JSDoc comments for methods & class.
    - Use Playwright locator strategies (page.locator, page.getByRole, etc.).
    - Use meaningful method names following async/await patterns.
    - Do NOT include explanations or test code.

    Context:
    DOM:
    \`\`\`html
    \${domContent}
    \`\`\`

    Example:
    \`\`\`typescript
    import { Page, Locator } from '@playwright/test';

    /**
     * Page Object for Component Page
     */
    export class ComponentPage {
      readonly page: Page;
      readonly usernameInput: Locator;
      readonly passwordInput: Locator;
      readonly loginButton: Locator;

      constructor(page: Page) {
        this.page = page;
        this.usernameInput = page.locator('#username');
        this.passwordInput = page.locator('#password');
        this.loginButton = page.locator('button:has-text("Login")');
      }

      /**
       * Navigate to the page
       */
      async goto(url: string) {
        await this.page.goto(url);
      }

      /**
       * Perform login action
       */
      async login(username: string, password: string) {
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
      }
    }
    \`\`\`

    Persona:
    - Audience: Automation engineer focusing on maintainable POM with Playwright.

    Output Format:
    - A single TypeScript class inside a \`\`\`typescript\`\`\` block.

    Tone:
    - Clean, maintainable, enterprise-ready.
  `,

  /**
   * Playwright TypeScript Feature File Only
   */
  PLAYWRIGHT_TS_FEATURE_ONLY: `
    Instructions:
    - Generate ONLY a Cucumber (.feature) file for Playwright TypeScript.
    - Use Scenario Outline with Examples table.
    - Make sure every step is relevant to the provided DOM.
    - Do not combine multiple actions into one step.
    - Use South India realistic dataset (names, addresses, pin codes, mobile numbers).
    - Use dropdown values only from provided DOM.
    - Generate multiple scenarios if applicable.

    Context:
    DOM:
    \`\`\`html
    \${domContent}
    \`\`\`

    Example:
    \`\`\`gherkin
    Feature: Login to OpenTaps

    Scenario Outline: Successful login with valid credentials
      Given I open the login page
      When I type "<username>" into the Username field
      And I type "<password>" into the Password field
      And I click the Login button
      Then I should be logged in successfully

    Examples:
      | username   | password  |
      | "testuser" | "testpass"|
      | "admin"    | "admin123"|
    \`\`\`

    Persona:
    - Audience: BDD testers using Playwright with TypeScript.

    Output Format:
    - Only valid Gherkin in a \`\`\`gherkin\`\`\` block.

    Tone:
    - Clear, structured, executable.
  `,

  /**
   * Playwright TypeScript Feature with Step Definitions
   */
  PLAYWRIGHT_TS_COMBINED: `
    Instructions:
    - Generate BOTH:
      1. A Cucumber .feature file.
      2. A TypeScript step definition file for Playwright.
    - Do NOT include Page Object code.
    - Step defs must include Playwright page/browser setup and actual Playwright code.
    - Use async/await patterns throughout.
    - Use Scenario Outline with Examples table (South India realistic data).

    Context:
    DOM:
    \`\`\`html
    \${domContent}
    \`\`\`
    URL: \${pageUrl}

    Example:
    \`\`\`gherkin
    Feature: Login to OpenTaps

    Scenario Outline: Successful login with valid credentials
      Given I open the login page
      When I type "<username>" into the Username field
      And I type "<password>" into the Password field
      And I click the Login button
      Then I should be logged in successfully

    Examples:
      | username   | password  |
      | "admin"    | "admin123"|
    \`\`\`

    \`\`\`typescript
    import { Given, When, Then, Before, After } from '@cucumber/cucumber';
    import { chromium, Browser, Page } from '@playwright/test';
    import { expect } from '@playwright/test';

    let browser: Browser;
    let page: Page;

    Before(async function() {
      browser = await chromium.launch({ headless: false });
      page = await browser.newPage();
    });

    After(async function() {
      await page.close();
      await browser.close();
    });

    Given('I open the login page', async function() {
      await page.goto('\${pageUrl}');
    });

    When('I type {string} into the Username field', async function(username: string) {
      await page.locator('#username').fill(username);
    });

    When('I type {string} into the Password field', async function(password: string) {
      await page.locator('#password').fill(password);
    });

    When('I click the Login button', async function() {
      await page.locator('button:has-text("Login")').click();
    });

    Then('I should be logged in successfully', async function() {
      await expect(page.locator('.success')).toBeVisible();
    });
    \`\`\`

    Persona:
    - Audience: QA engineers working with Cucumber & Playwright TypeScript.

    Output Format:
    - Gherkin in \`\`\`gherkin\`\`\` block + TypeScript code in \`\`\`typescript\`\`\` block.

    Tone:
    - Professional, executable, structured.
  `,

  /**
   * Test Data Generation using Boundary Value Analysis and Equivalent Partitioning
   */
  TEST_DATA_GENERATION: `
    Instructions:
    - Generate test data sets for the provided DOM elements.
    - MUST generate between 3 to 5 test data sets.
    - Use Boundary Value Analysis (BVA) and Equivalent Partitioning (EP) techniques.
    - For text inputs: consider min length, max length, empty, special characters, valid/invalid formats.
    - For numeric inputs: consider min value, max value, zero, negative, positive, boundary values.
    - For dropdowns/select: include valid options from DOM, first option, last option, middle option.
    - For email fields: valid email, invalid format, missing @, missing domain.
    - For phone numbers: valid format, too short, too long, special characters.
    - For dates: past dates, future dates, current date, invalid formats.
    - For required fields: empty values (negative test), valid values (positive test).
    - Consider the additional instructions provided by the user.
    - Use South India realistic data (names like Rajesh, Priya, Lakshmi; cities like Chennai, Bangalore, Hyderabad; pin codes like 600001, 560001).

    Context:
    DOM:
    \`\`\`html
    \${domContent}
    \`\`\`

    Additional Instructions:
    \${userAction}

    Output Format:
    - Generate test data in a structured table format using markdown.
    - Include a "Test Case Type" column indicating BVA/EP category.
    - Include a "Expected Result" column (Pass/Fail).

    Example:
    \`\`\`markdown
    ## Test Data Sets

    ### Test Data Set 1: Valid Data (Positive - Equivalent Partition)
    | Field Name | Value | Test Case Type | Expected Result |
    |------------|-------|----------------|------------------|
    | Username   | rajesh.kumar@example.com | Valid Email - EP | Pass |
    | Password   | SecurePass123! | Valid Password - EP | Pass |
    | First Name | Rajesh | Valid Name - EP | Pass |
    | Age        | 25 | Valid Age - EP | Pass |
    | City       | Chennai | Valid Option - EP | Pass |

    ### Test Data Set 2: Boundary Value - Minimum (BVA)
    | Field Name | Value | Test Case Type | Expected Result |
    |------------|-------|----------------|------------------|
    | Username   | a@b.c | Min Length Email - BVA | Pass |
    | Password   | Pass1! | Min Length Password - BVA | Pass |
    | First Name | A | Min Length Name - BVA | Pass |
    | Age        | 18 | Minimum Age - BVA | Pass |
    | City       | Bangalore | First Option - BVA | Pass |

    ### Test Data Set 3: Boundary Value - Maximum (BVA)
    | Field Name | Value | Test Case Type | Expected Result |
    |------------|-------|----------------|------------------|
    | Username   | very.long.email.address@example.domain.com | Max Length Email - BVA | Pass |
    | Password   | VeryLongPassword123!@#$ | Max Length Password - BVA | Pass |
    | First Name | Thiruvananthapuram | Max Length Name - BVA | Pass |
    | Age        | 65 | Maximum Age - BVA | Pass |
    | City       | Hyderabad | Last Option - BVA | Pass |

    ### Test Data Set 4: Invalid Data - Negative Test (EP)
    | Field Name | Value | Test Case Type | Expected Result |
    |------------|-------|----------------|------------------|
    | Username   | invalid-email | Invalid Email Format - EP | Fail |
    | Password   | weak | Too Short Password - EP | Fail |
    | First Name | (empty) | Empty Required Field - EP | Fail |
    | Age        | -5 | Negative Age - BVA | Fail |
    | City       | (empty) | Empty Selection - EP | Fail |

    ### Test Data Set 5: Edge Cases (BVA)
    | Field Name | Value | Test Case Type | Expected Result |
    |------------|-------|----------------|------------------|
    | Username   | user@domain | Missing TLD - BVA | Fail |
    | Password   | NoSpecial123 | Missing Special Char - EP | Fail |
    | First Name | 123Numbers | Invalid Characters - EP | Fail |
    | Age        | 0 | Zero Age - BVA | Fail |
    | City       | Invalid Option | Non-existent Option - EP | Fail |
    \`\`\`

    Persona:
    - Audience: QA engineers and testers who need comprehensive test data coverage.

    Tone:
    - Systematic, thorough, testing-focused.
  `,

  /**
   * Selenium Java Test Scripts using Page Objects
   */
  SELENIUM_JAVA_TEST_SCRIPTS: `
    Instructions:
    - Generate ONLY a Selenium Java Test Class that uses Page Objects.
    - The test class MUST import and instantiate the page object class.
    - Use TestNG annotations (@Test, @BeforeMethod, @AfterMethod).
    - Include WebDriver initialization and cleanup.
    - Tests should call methods from the Page Object class.
    - Use crisp single-line comments only.
    - Include assertions using TestNG Assert.
    - Use South India realistic test data (names, addresses, pin codes).
    - Do NOT include Page Object class code.

    Context:
    DOM:
    \`\`\`html
    \${domContent}
    \`\`\`
    URL: \${pageUrl}

    Additional Instructions:
    \${userAction}

    Example:
    \`\`\`java
    package com.testleaf.tests;

    import org.testng.annotations.*;
    import org.testng.Assert;
    import org.openqa.selenium.WebDriver;
    import org.openqa.selenium.chrome.ChromeDriver;
    import com.testleaf.pages.LoginPage;

    public class LoginTest {
        private WebDriver driver;
        private LoginPage loginPage;

        @BeforeMethod
        public void setUp() {
            driver = new ChromeDriver();
            driver.manage().window().maximize();
            loginPage = new LoginPage(driver);
        }

        @AfterMethod
        public void tearDown() {
            if (driver != null) driver.quit();
        }

        @Test
        public void testValidLogin() {
            // Navigate to login page
            driver.get("\${pageUrl}");
            
            // Perform login using page object
            loginPage.enterUsername("rajesh.kumar@example.com");
            loginPage.enterPassword("SecurePass123!");
            loginPage.clickLoginButton();
            
            // Verify successful login
            Assert.assertTrue(loginPage.isLoginSuccessful(), "Login should be successful");
        }

        @Test
        public void testInvalidLogin() {
            // Navigate to login page
            driver.get("\${pageUrl}");
            
            // Attempt login with invalid credentials
            loginPage.enterUsername("invalid@example.com");
            loginPage.enterPassword("wrongpass");
            loginPage.clickLoginButton();
            
            // Verify error message is displayed
            Assert.assertTrue(loginPage.isErrorDisplayed(), "Error message should be displayed");
        }
    }
    \`\`\`

    Persona:
    - Audience: Automation engineers who need executable test scripts using POM.

    Output Format:
    - A single Java test class inside a \`\`\`java\`\`\` block.

    Tone:
    - Professional, executable, maintainable.
  `,

  /**
   * Playwright TypeScript Test Scripts using Page Objects
   */
  PLAYWRIGHT_TS_TEST_SCRIPTS: `
    Instructions:
    - Generate ONLY a Playwright TypeScript Test file that uses Page Objects.
    - The test file MUST import and instantiate the page object class.
    - Use Playwright test syntax with test.describe and test().
    - Include beforeEach and afterEach hooks for setup/cleanup.
    - Tests should call methods from the Page Object class.
    - Use crisp single-line comments only.
    - Include assertions using expect() from Playwright.
    - Use South India realistic test data (names, addresses, pin codes).
    - Do NOT include Page Object class code.

    Context:
    DOM:
    \`\`\`html
    \${domContent}
    \`\`\`
    URL: \${pageUrl}

    Additional Instructions:
    \${userAction}

    Example:
    \`\`\`typescript
    import { test, expect, Page, Browser, chromium } from '@playwright/test';
    import { LoginPage } from '../pages/LoginPage';

    test.describe('Login Tests', () => {
      let browser: Browser;
      let page: Page;
      let loginPage: LoginPage;

      test.beforeEach(async () => {
        browser = await chromium.launch({ headless: false });
        page = await browser.newPage();
        loginPage = new LoginPage(page);
        await page.goto('\${pageUrl}');
      });

      test.afterEach(async () => {
        await page.close();
        await browser.close();
      });

      test('should login successfully with valid credentials', async () => {
        // Perform login using page object
        await loginPage.enterUsername('rajesh.kumar@example.com');
        await loginPage.enterPassword('SecurePass123!');
        await loginPage.clickLoginButton();
        
        // Verify successful login
        await expect(page.locator('.success-message')).toBeVisible();
      });

      test('should show error with invalid credentials', async () => {
        // Attempt login with invalid credentials
        await loginPage.enterUsername('invalid@example.com');
        await loginPage.enterPassword('wrongpass');
        await loginPage.clickLoginButton();
        
        // Verify error message is displayed
        await expect(page.locator('.error-message')).toBeVisible();
      });

      test('should validate empty form submission', async () => {
        // Submit empty form
        await loginPage.clickLoginButton();
        
        // Verify validation errors
        await expect(page.locator('.validation-error')).toBeVisible();
      });
    });
    \`\`\`

    Persona:
    - Audience: Automation engineers who need executable Playwright test scripts using POM.

    Output Format:
    - A single TypeScript test file inside a \`\`\`typescript\`\`\` block.

    Tone:
    - Professional, executable, maintainable.
  `
};

/**
 * Helper function to escape code blocks in prompts
 */
function escapeCodeBlocks(text) {
  return text.replace(/```/g, '\\`\\`\\`');
}

/**
 * Function to fill template variables in a prompt
 */
export function getPrompt(promptKey, variables = {}) {
  let prompt = DEFAULT_PROMPTS[promptKey];
  if (!prompt) {
    throw new Error(`Prompt not found: ${promptKey}`);
  }

  Object.entries(variables).forEach(([k, v]) => {
    const regex = new RegExp(`\\$\\{${k}\\}`, 'g');
    prompt = prompt.replace(regex, v);
  });

  return prompt.trim();
}

export const CODE_GENERATOR_TYPES = {
  SELENIUM_JAVA_PAGE_ONLY: 'Selenium-Java-Page-Only',
  CUCUMBER_ONLY: 'Cucumber-Only',
  CUCUMBER_WITH_SELENIUM_JAVA_STEPS: 'Cucumber-With-Selenium-Java-Steps',
  PLAYWRIGHT_TS_PAGE_ONLY: 'Playwright-TypeScript-Page-Only',
  PLAYWRIGHT_TS_FEATURE_ONLY: 'Playwright-TypeScript-Feature-Only',
  PLAYWRIGHT_TS_COMBINED: 'Playwright-TypeScript-Combined',
  TEST_DATA_GENERATION: 'Test-Data-Generation',
  SELENIUM_JAVA_TEST_SCRIPTS: 'Selenium-Java-Test-Scripts',
  PLAYWRIGHT_TS_TEST_SCRIPTS: 'Playwright-TypeScript-Test-Scripts',
};
