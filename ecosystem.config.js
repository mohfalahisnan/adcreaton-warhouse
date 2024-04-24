module.exports = {
  apps: [
    {
      name: "next-app",
      script: "npm",
      args: "run dev",
      env: {
        NODE_ENV: "development",
      },
    },
  ],
};
