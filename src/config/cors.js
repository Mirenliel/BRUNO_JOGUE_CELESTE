const allowedOrigins = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(Object.assign(new Error("Origem nao permitida pelo CORS"), {
      status: 403,
    }));
  },
};

export { allowedOrigins };
export default corsOptions;
