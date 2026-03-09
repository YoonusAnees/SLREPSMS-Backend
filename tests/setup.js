const originalError = console.error;
const originalLog = console.log;

beforeAll(() => {

  console.error = (...args) => {
    const msg = args[0];

    if (msg && msg.name === "ZodError") {
      return;
    }

    originalError(...args);
  };

  console.log = (...args) => {

    const text = args.join(" ");

    if (text.includes("[dotenv@")) {
      return;
    }

    originalLog(...args);

  };

});

afterAll(() => {
  console.error = originalError;
  console.log = originalLog;
});