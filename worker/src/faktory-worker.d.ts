declare module "faktory-worker" {
  export class Faktory {
    static connect(options?: object): any;
    static register(jobName: string, cb: Function): any;
    static work(options: object): any;
  }

  export class Client {
    constructor(options?: ClientOptions);
    public push(job: Job): Promise<string>;
    public job(jobName: string, ...args: any[]): Job;
  }

  export class Job {
    constructor(jobName: string);

    public toJSON(): string;
    public push(): string;

    public jid: string;
    public queue: string;
    public args: any[];
    public priority: number;
    public retry: number;
    public at: Date | string;
    public reserveFor: number;
    public custom: object;
  }

  export type ClientOptions = {
    url: string;
    host: string;
    port: number | string;
    password: string;
    wid: string;
    labels: string[];
    poolSize: number;
  };
}
