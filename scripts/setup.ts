import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import axios from 'axios';
import * as winston from 'winston';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function validateCredentials(username: string, password: string): Promise<boolean> {
  try {
    // Create an axios instance with basic auth
    const client = axios.create({
      baseURL: 'https://api.wpengineapi.com/v1',
      auth: {
        username,
        password
      }
    });

    // Try to hit the status endpoint
    await client.get('/status');
    return true;
  } catch (error) {
    return false;
  }
}
  async function main(): Promise<void> {
    winston.info('WP Engine API TypeScript SDK Setup\n');
    winston.info('WP Engine API TypeScript SDK Setup\n');
    winston.info('This script will help you set up your WP Engine API credentials.\n');
    winston.info('This script will help you set up your WP Engine API credentials.\n');

  try {
    // Get credentials
    const username = await question('Enter your WP Engine API username: ');
    const password = await question('Enter your WP Engine API password: ');

    winston.info('\nValidating credentials...');
    const isValid = await validateCredentials(username, password);

    if (!isValid) {
      console.error('\nError: Invalid credentials. Please check your username and password.');
      process.exit(1);
    }

    winston.info('Credentials validated successfully!\n');

    // Get environment names
    winston.info('You can set up multiple environments (e.g., Default, Staging, Production)');
    winston.info('Press Enter without a name to finish adding environments.\n');

    const environments: { name: string; username: string; password: string }[] = [];
    let envName: string;

    do {
      envName = await question(`Enter environment name (or press Enter to finish) ${environments.length === 0 ? '[Default]: ' : ': '}`);
      
      if (envName === '' && environments.length === 0) {
        envName = 'Default';
      }

      if (envName) {
        const useDefaultCreds = await question('Use the same credentials for this environment? (Y/n): ');
        
        if (useDefaultCreds.toLowerCase() !== 'n') {
          environments.push({
            name: envName,
            username,
            password
          });
        } else {
          const envUsername = await question('Enter username for this environment: ');
          const envPassword = await question('Enter password for this environment: ');
          
          winston.info('\nValidating environment credentials...');
          const isEnvValid = await validateCredentials(envUsername, envPassword);

          if (!isEnvValid) {
            console.error('Error: Invalid credentials for this environment. Skipping...');
            continue;
          }

          environments.push({
            name: envName,
            username: envUsername,
            password: envPassword
          });
        }
      }
    } while (envName);

    // Create config file
    const configPath = path.join(process.cwd(), '.env');
    let configContent = '';

    environments.forEach(env => {
      configContent += `[${env.name}]\n`;
      configContent += `WPENGINE_USERNAME=${env.username}\n`;
      configContent += `WPENGINE_PASSWORD=${env.password}\n\n`;
    });

    fs.writeFileSync(configPath, configContent);

    winston.info('\nConfiguration file created successfully!');
    winston.info(`Location: ${configPath}`);
    winston.info('\nMake sure to add .env to your .gitignore file to keep your credentials secure.');

    // Create .gitignore if it doesn't exist
    const gitignorePath = path.join(process.cwd(), '.gitignore');
    if (!fs.existsSync(gitignorePath)) {
      fs.writeFileSync(gitignorePath, '.env\n');
      winston.info('.gitignore file created with .env entry.');
    } else {
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
      if (!gitignoreContent.includes('.env')) {
        fs.appendFileSync(gitignorePath, '\n.env\n');
        winston.info('.env entry added to existing .gitignore file.');
      }
    }

    winston.info('\nSetup complete! You can now use the WP Engine TypeScript SDK.');
    winston.info('See the README.md file for usage examples.');

  } catch (error) {
    console.error('An error occurred during setup:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the setup
if (require.main === module) {
  main().catch(console.error);
}
