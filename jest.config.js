module.exports = {
	moduleFileExtensions: ["js", "json", "ts"],
	rootDir: "src",
	testRegex: ".*\\.(spec|integration-spec)\\.ts$",
	transform: {
		"^.+\\.(t|j)s$": "ts-jest",
	},
	collectCoverageFrom: [
		"**/*.(t|j)s",
		"!**/*.module.ts",
		"!**/main.ts",
		"!**/*.dto.ts",
		"!**/*.entity.ts",
	],
	coverageDirectory: "../coverage",
	testEnvironment: "node",
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/$1",
		"^@modules/(.*)$": "<rootDir>/modules/$1",
		"^@shared/(.*)$": "<rootDir>/shared/$1",
	},
};
