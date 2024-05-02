import { Prisma } from "@prisma/client";

export const handlePrismaError = (error: any): string => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle known request errors with specific codes
    switch (error.code) {
      case "P2002":
        return "Unique constraint violation, operation cannot be completed";
      case "P2003":
        return "Foreign key constraint failed";
      case "P1001":
        return "Database server cannot be reached";
      case "P1002":
        return "Connection to the database server timed out";
      // Add other Prisma error codes and corresponding messages as needed
      default:
        return `Database error: ${error.message}`;
    }
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    return "Validation error occurred during the database operation";
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    return "Database initialization error";
  } else if (error instanceof Prisma.PrismaClientRustPanicError) {
    return "Unexpected database error occurred";
  }

  // Default error message
  return "An unknown error occurred";
};
