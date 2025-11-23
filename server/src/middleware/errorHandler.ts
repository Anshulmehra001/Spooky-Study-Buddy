import { Request, Response, NextFunction } from 'express';

export interface SpookyError extends Error {
  statusCode?: number;
  character?: string;
  suggestedAction?: string;
}

const spookyCharacters = [
  {
    name: 'Friendly Ghost',
    personality: 'helpful and encouraging',
    catchphrase: 'Boo-hoo! Don\'t worry, we can fix this!'
  },
  {
    name: 'Wise Witch',
    personality: 'knowledgeable and patient',
    catchphrase: 'Hocus pocus! Let me help you focus!'
  },
  {
    name: 'Cheerful Vampire',
    personality: 'optimistic and supportive',
    catchphrase: 'Blah! No need to be batty about this error!'
  },
  {
    name: 'Helpful Skeleton',
    personality: 'straightforward and clear',
    catchphrase: 'Bone-afide advice coming your way!'
  }
];

function getRandomCharacter() {
  return spookyCharacters[Math.floor(Math.random() * spookyCharacters.length)];
}

export function errorHandler(
  err: SpookyError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const character = getRandomCharacter();
  const statusCode = err.statusCode || 500;
  
  let message = err.message || 'Something spooky happened!';
  let suggestedAction = err.suggestedAction;

  // Customize error messages based on error type
  if (err.message?.includes('File too large')) {
    message = 'Whoa! That file is bigger than a haunted mansion!';
    suggestedAction = 'Try uploading a smaller file (under 10MB) or break your content into smaller pieces.';
  } else if (err.message?.includes('Invalid file type')) {
    message = 'Hmm, that file type gives me the creeps!';
    suggestedAction = 'Please upload a .txt or .pdf file, or paste your text directly.';
  } else if (err.message?.includes('OpenAI')) {
    message = 'The spirits are having trouble connecting to the AI realm!';
    suggestedAction = 'Please try again in a moment. If the problem persists, the AI service might be temporarily unavailable.';
  } else if (statusCode === 404) {
    message = 'This page has vanished into thin air!';
    suggestedAction = 'Check the URL or navigate back to the main page.';
  } else if (statusCode >= 500) {
    message = 'Our cauldron seems to be bubbling over!';
    suggestedAction = 'Please try again in a moment. If the problem continues, our ghost developers are on it!';
  }

  const errorResponse = {
    error: true,
    message,
    character: {
      name: character.name,
      personality: character.personality,
      catchphrase: character.catchphrase
    },
    suggestedAction,
    errorCode: `SPOOKY_${statusCode}`,
    timestamp: new Date().toISOString()
  };

  console.error(`[${new Date().toISOString()}] Error ${statusCode}:`, err.message);
  console.error('Stack:', err.stack);

  res.status(statusCode).json(errorResponse);
}

export function createSpookyError(
  message: string, 
  statusCode: number = 500, 
  suggestedAction?: string
): SpookyError {
  const error = new Error(message) as SpookyError;
  error.statusCode = statusCode;
  error.suggestedAction = suggestedAction;
  return error;
}