export interface CodeExample {
  id: string;
  title: string;
  description: string;
  language: string;
  code: string;
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface Plugin {
  name: string;
  type: 'core' | 'optional';
  description: string;
}

export interface CLICommand {
  command: string;
  description: string;
  options?: string[];
}

export interface Example {
  id: string;
  title: string;
  category: string;
  description: string;
  code: string;
}
