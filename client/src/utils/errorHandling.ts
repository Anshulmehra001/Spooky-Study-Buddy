interface SpookyError {
  message: string;
  character: 'ghost' | 'witch' | 'vampire' | 'skeleton';
  suggestion: string;
  action?: string;
  severity: 'low' | 'medium' | 'high';
}

export const createSpookyError = (
  error: string | Error,
  context: 'upload' | 'story' | 'quiz' | 'progress' | 'network' = 'network'
): SpookyError => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  // Network errors
  if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('fetch')) {
    return {
      message: "The spirits seem to have lost connection to the digital realm!",
      character: 'ghost',
      suggestion: "Check your internet connection and try again. The ghosts are working to restore the connection!",
      action: "Retry",
      severity: 'medium'
    };
  }

  // File upload errors
  if (context === 'upload') {
    if (errorMessage.toLowerCase().includes('size') || errorMessage.toLowerCase().includes('large')) {
      return {
        message: "Whoa! That file is too big for my cauldron!",
        character: 'witch',
        suggestion: "Try a smaller file (under 10MB) or break your content into smaller pieces.",
        action: "Choose smaller file",
        severity: 'low'
      };
    }
    
    if (errorMessage.toLowerCase().includes('type') || errorMessage.toLowerCase().includes('format')) {
      return {
        message: "Hmm, I can't read this type of scroll!",
        character: 'vampire',
        suggestion: "Please use .txt or .pdf files. Other formats are still being learned by our spooky friends.",
        action: "Choose different file",
        severity: 'low'
      };
    }
  }

  // Story generation errors
  if (context === 'story') {
    if (errorMessage.toLowerCase().includes('timeout') || errorMessage.toLowerCase().includes('slow')) {
      return {
        message: "The story spirits are taking longer than usual to craft your tale!",
        character: 'witch',
        suggestion: "This sometimes happens with complex content. Please wait a bit longer or try with shorter text.",
        action: "Wait or simplify",
        severity: 'medium'
      };
    }
    
    if (errorMessage.toLowerCase().includes('content') || errorMessage.toLowerCase().includes('empty')) {
      return {
        message: "I need some content to work my magic!",
        character: 'ghost',
        suggestion: "Please provide some study material - text, notes, or upload a file to get started.",
        action: "Add content",
        severity: 'low'
      };
    }
  }

  // Quiz errors
  if (context === 'quiz') {
    if (errorMessage.toLowerCase().includes('generate') || errorMessage.toLowerCase().includes('questions')) {
      return {
        message: "The quiz spirits are having trouble creating questions from this story!",
        character: 'skeleton',
        suggestion: "The story might be too short or complex. Try a different story or wait a moment and retry.",
        action: "Try different story",
        severity: 'medium'
      };
    }
  }

  // Progress errors
  if (context === 'progress') {
    return {
      message: "The progress spirits are having trouble updating your achievements!",
      character: 'vampire',
      suggestion: "Don't worry, your progress is still saved. This is just a display issue that will resolve itself.",
      action: "Continue anyway",
      severity: 'low'
    };
  }

  // Generic errors
  return {
    message: "Something spooky happened in the digital realm!",
    character: 'ghost',
    suggestion: "Try refreshing the page or waiting a moment. If the problem persists, the spirits suggest checking your internet connection.",
    action: "Refresh page",
    severity: 'medium'
  };
};

export const getCharacterMessage = (character: SpookyError['character'], context: string): string => {
  const messages = {
    ghost: [
      "Boo! Don't worry, I'll help you through this!",
      "Oops! Even ghosts make mistakes sometimes!",
      "Floating over to help you fix this issue!",
      "Spooky! But not to worry, we'll sort this out!"
    ],
    witch: [
      "Let me brew up a solution for you!",
      "My cauldron is bubbling with ideas to fix this!",
      "Abracadabra! Well, that didn't work as expected...",
      "Time to cast a debugging spell!"
    ],
    vampire: [
      "Blah! This error has drained my energy, but I'll help!",
      "I've seen this before in my centuries of existence!",
      "Don't let this bite you - we'll fix it together!",
      "Even vampires encounter technical difficulties!"
    ],
    skeleton: [
      "Rattling my bones to find a solution!",
      "This error is bone-chilling, but fixable!",
      "I've got a bone to pick with this bug!",
      "Dem bones, dem bones, dem error bones!"
    ]
  };

  const characterMessages = messages[character];
  return characterMessages[Math.floor(Math.random() * characterMessages.length)];
};

export const playErrorSound = () => {
  if ((window as any).spookySounds?.error) {
    (window as any).spookySounds.error();
  }
};

export const playSuccessSound = () => {
  if ((window as any).spookySounds?.success) {
    (window as any).spookySounds.success();
  }
};