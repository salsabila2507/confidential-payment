# Feedback — iExec Vibe Coding Challenge

## What went well
- Nox Protocol SDK is well-documented with clear examples
- The encrypted computation pattern (encrypt → compute → decrypt) is intuitive
- Deployment to Arbitrum Sepolia was smooth

## Challenges
- Understanding the handle/proof pattern took some time
- `externalEuint256` type handling differs from regular Solidity patterns
- View functions can't use `Nox.allow()` since it modifies state

## Suggestions
- More end-to-end examples for common DeFi patterns (payment, swap)
- A starter template/boilerplate would speed up development
- Clearer docs on which functions modify state vs read-only

## Overall
Great protocol for privacy-preserving DeFi. The SDK abstracts away most complexity of FHE operations.
