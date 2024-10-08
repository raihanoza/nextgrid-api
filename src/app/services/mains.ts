export const ErrorHandler = async (errors: any[]) => {
    const errorMessages: { [key: string]: string } = {};
    
    errors.forEach((err: any) => {
      if (err.path && err.path.length > 0) {
        errorMessages[err.path[0]] = err.message;
      }
    });
    
    return errorMessages;
};