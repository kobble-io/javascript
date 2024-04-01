# Contributing

Before contributing to this project, make sure you have read our [guidelines](https://docs.kobble.io).

## Manual testing

### Using hot reload

Since the library is built in es format with vite, you can test it directly in the `index.html` file by importing the module script.

This allows a fast feedback loop during development.

```html
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + TS</title>
</head>
<body>
<div id="app"></div>
<script type="module">
    import { createKobbleClient } from "./src/main";
    const kobble = createKobbleClient({ 
        
    });
</script>
</body>
</html>
```

### Using package linking

If you want to test the library in a real project, you can use the `npm link` command.

First, build the library:

```bash
npm run build
```

Then link the package:

```bash
npm link
```

In the project where you want to use the library, link it:

```bash
npm link <your-package-name>
```

Now you can import the library in your project as if it was a real package.

```ts
import { sayHello } from 'your-package-name';
sayHello();
```

To clean up the links, run the following commands (order is important).

First in the project where you linked the package:

```bash
npm unlink --no-save your-package-name
```

Then in the library project:

```bash
# In the library project
npm unlink
```


## Unit tests

Tests are written with Jest and can be run with the following command:

```bash
npm run test
```

All tests must be written in the `__tests__` directory. Every test file must have the `.test.ts` extension.

## Build for production

```bash
npm run build
```
