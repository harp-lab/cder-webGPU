# Install WebGPU

## Step 1: Project Initialization
We begin by creating a new directory and initializing it as an npm package. This step establishes the foundation of our project structure and generates a `package.json` file that will track our dependencies and scripts.

```
mkdir webgpu-project
cd webgpu-project
npm init -y
```

## Step 2: Install Dependencies
Next, we install the necessary development dependencies. Each package serves a specific purpose in our development workflow, creating a robust development environment with type checking, build automation, and hot reloading capabilities.

```
npm install --save-dev typescript ts-loader webpack webpack-cli webpack-dev-server
npm install --save-dev html-webpack-plugin style-loader css-loader
npm install --save-dev @webgpu/types
```

## Step 3: Configure TypeScript
TypeScript configuration is crucial for defining how our TypeScript code will be compiled. We create a `tsconfig.json` file in the root directory:

```
{
 "compilerOptions": {
   "target": "ES2020",
   "module": "ES2020",
   "moduleResolution": "node",
   "esModuleInterop": true,
   "strict": true,
   "outDir": "./dist",
   "sourceMap": true,
   "lib": ["DOM", "ES2020"],
   "typeRoots": ["./node_modules/@webgpu/types", "./node_modules/@types"]
 },
 "include": ["src/**/*"]
}
```
This TypeScript configuration establishes an optimized development environment specifically tailored for WebGPU projects. It targets ES2020 JavaScript, providing access to modern language features. The configuration enables strict type checking to catch potential errors during development, generating source maps that facilitate debugging by mapping compiled JavaScript back to the original TypeScript code. It incorporates DOM type definitions for seamless interaction with browser APIs and explicitly includes the WebGPU type definitions to provide intelligent code completion and type checking for WebGPU-specific constructs. 

## Step 4: Configure Webpack
Webpack orchestrates our build process. The configuration below defines how our source files should be processed and bundled:

```
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        // Embed your WGSL files as strings
        test: /\.wgsl$/i,
        type: "asset/source",
      }
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 9000,
  },
};
```
The webpack configuration establishes key development parameters for our WebGPU project. It enables development mode for enhanced debugging, designates our TypeScript file as the entry point, and configures the necessary loaders for processing TypeScript and CSS resources. The configuration specifies where bundled output files should be placed and employs HtmlWebpackPlugin to automatically integrate our compiled JavaScript into the HTML template. Most importantly, it initializes a development server with hot reloading capability, providing an essential local testing environment that automatically rebuilds the application whenever code changes are detected.

## Step 5: Create Project Structure
A well-organized project structure helps maintain code clarity as the project grows:

```
mkdir -p src
touch src/index.html src/index.ts
```

## Step 6: Set Up HTML File
The HTML file serves as the container for our WebGPU application:

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WebGPU Availability Check</title>
</head>
<body>
    <h1>WebGPU Availability Check</h1>
    <div id="status">Checking WebGPU support...</div>
</body>
</html>
```

## Step 7: Implement WebGPU in TypeScript
The TypeScript file contains the code that checks for WebGPU support in the browser.

```
async function checkWebGPU() {
    const statusElement = document.getElementById('status') as HTMLDivElement;
    
    // Check if WebGPU is supported
    if (!navigator.gpu) {
        statusElement.textContent = 'WebGPU is not supported in your browser.';
        statusElement.style.color = 'red';
        return false;
    }
    
    try {
        // Request adapter
        const adapter = await navigator.gpu.requestAdapter();

        if (!adapter) {
            statusElement.textContent = 'Failed to get GPU adapter.';
            statusElement.style.color = 'red';
            return false;
        }
              
        // Request device
        const device = await adapter.requestDevice();
                      
        // Show success message
        statusElement.textContent = `WebGPU is supported and ready!`;
        statusElement.style.color = 'green';
        return true;
    } catch (error) {
        statusElement.textContent = `Error initializing WebGPU: ${error instanceof Error ? error.message : String(error)}`;
        statusElement.style.color = 'red';
        return false;
    }
}

// Run check when page loads
window.addEventListener('load', () => {
    checkWebGPU().then(supported => {
        console.log(`WebGPU supported: ${supported}`);
    });
});
```

## Step 8: Add npm Scripts
Update the package.json file to include scripts for building and running the project:

```
{
 "scripts": {
   "build": "webpack",
   "serve": "webpack server"
 }
}
```

## Step 9: Run the Project
With all configurations in place, we can now run the project:

```
npm run serve
```
