const gitUtils = require("./dummyGitUtils");
const prxTasksLib = require("./prxTasks");

let prxTasks;
let shelljs;
beforeEach(() => {
  jest.mock("shelljs", () => {
    return {
      exec: jest.fn(() => ({ code: 0 })),
      echo: jest.fn(),
    }
  })
  shelljs = require("shelljs");
  prxTasks = prxTasksLib(shelljs, gitUtils);
});

afterEach(() => {
  jest.resetModules();
  jest.resetAllMocks();
  gitUtils._reset();
})

test("prxTasks.checkBranchIsNotMain returns 0 for non-main branch", () => {
  gitUtils.getBranch = () => 'not-main';
  const exitCode = prxTasks.checkBranchIsNotMain();
  expect(exitCode).toEqual(0);
});

test("prxTasks.checkBranchIsNotMain returns 1 for main branch", () => {
  gitUtils.getBranch = () => 'main';
  const exitCode = prxTasks.checkBranchIsNotMain();
  expect(exitCode).toEqual(1);
});

test("prxTasks.pushBranch calls git push with the correct arguments", () => {
  const exitCode = prxTasks.pushBranch();
  expect(exitCode).toEqual(0);
  expect(shelljs.exec).toHaveBeenCalledWith(`git push --set-upstream origin ${gitUtils.getBranch()}`);
});

test("prxTasks.createPR calls start with the correct url", () => {
  const exitCode = prxTasks.createPR();
  expect(exitCode).toEqual(0);
  expect(shelljs.exec).toHaveBeenCalledWith(`start ${gitUtils.getRepoUrl()}/pull/new/${gitUtils.getBranch()}`);
});

test("prxTasks.checkLengthOfBranchName calls git branch with the correct arguments", () => {
  const r = prxTasks.checkLengthOfBranchName();
  expect(r).toEqual({ code: 0, length: gitUtils.getBranch().length });
});

test("prxTasks.checkBranchNameStartsWithCorrectPrefix calls git branch with the correct arguments", () => {
  gitUtils.getBranch = () => "ots-1234/dummy-branch";
  const r = prxTasks.checkBranchNameStartsWithCorrectPrefix();
  expect(r).toEqual({ code: 0 });

  gitUtils.getBranch = () => "dummy-branch";
  const r2 = prxTasks.checkBranchNameStartsWithCorrectPrefix();
  expect(r2).toEqual({ code: 1 });
});
