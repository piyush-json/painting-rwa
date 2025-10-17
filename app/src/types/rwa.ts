/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/rwa.json`.
 */
export type Rwa = {
  "address": "Guhyo3fAg6Qys962ngVbsidvzEWsBiGmZ3XYMyo73MfE",
  "metadata": {
    "name": "rwa",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "docs": [
    "Fractional Art Investment Platform",
    "",
    "A cutting-edge Solana-based platform that democratizes fine art investment",
    "by transforming multi-million dollar paintings into affordable, tradable digital assets.",
    "",
    "## Key Features:",
    "- NFT Fractionalization: Convert single NFTs into thousands of tradeable shares",
    "- Token-2022 Integration: Automatic royalty distribution on secondary sales",
    "- KYC Compliance: Built-in verification system for regulatory compliance",
    "- Secure Vaulting: Original NFTs locked until full redemption",
    "- Global Access: Enable worldwide art investment with small amounts",
    "",
    "## Hackathon-Friendly KYC Flow:",
    "1. **Simple Registration**: Users register with minimal info (email, country)",
    "2. **Auto-Verification**: Demo mode allows instant verification",
    "3. **Mock Verification**: Simulate email/document verification",
    "4. **Admin Override**: Admins can manually verify users",
    "5. **Compliance Ready**: Structure supports real KYC providers"
  ],
  "instructions": [
    {
      "name": "buyFractions",
      "docs": [
        "Buy fractional tokens (SIMPLIFIED FOR HACKATHON)",
        "",
        "This instruction allows KYC-verified users to purchase fractional tokens.",
        "Uses standard SPL Token transfers for simplicity."
      ],
      "discriminator": [
        251,
        104,
        152,
        46,
        70,
        130,
        211,
        220
      ],
      "accounts": [
        {
          "name": "buyer",
          "docs": [
            "The buyer purchasing fractional tokens"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "vault",
          "docs": [
            "The vault containing the fractionalized NFT"
          ],
          "writable": true
        },
        {
          "name": "fractionalTokenMint",
          "docs": [
            "Fractional token mint"
          ],
          "writable": true
        },
        {
          "name": "buyerFractionalAccount",
          "docs": [
            "Buyer's fractional token account"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "buyer"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "fractionalTokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "vaultFractionalAccount",
          "docs": [
            "Vault's fractional token account"
          ],
          "writable": true
        },
        {
          "name": "buyerPaymentAccount",
          "docs": [
            "Buyer's payment token account (USDC)"
          ],
          "writable": true
        },
        {
          "name": "creatorPaymentAccount",
          "docs": [
            "Creator's payment token account for receiving proceeds"
          ],
          "writable": true
        },
        {
          "name": "kycAccount",
          "docs": [
            "Buyer's KYC account for compliance verification"
          ]
        },
        {
          "name": "platformAuthority",
          "docs": [
            "Platform authority for payment distribution"
          ]
        },
        {
          "name": "tokenProgram",
          "docs": [
            "Token program for standard SPL tokens"
          ],
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "docs": [
            "Associated token program for creating ATAs"
          ],
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "docs": [
            "System program for account creation"
          ],
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "numFractions",
          "type": "u64"
        }
      ]
    },
    {
      "name": "fractionalize",
      "docs": [
        "Fractionalize an NFT into tradeable shares (SIMPLIFIED FOR HACKATHON)",
        "",
        "This instruction takes an NFT and creates fractional ownership tokens.",
        "Uses standard SPL Token for simplicity and speed."
      ],
      "discriminator": [
        183,
        200,
        238,
        51,
        180,
        45,
        49,
        67
      ],
      "accounts": [
        {
          "name": "creator",
          "docs": [
            "The original NFT owner who wants to fractionalize their asset"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "originalNftMint",
          "docs": [
            "The NFT mint being fractionalized"
          ]
        },
        {
          "name": "vault",
          "docs": [
            "Vault account that will store the NFT and manage fractional tokens"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "originalNftMint"
              }
            ]
          }
        },
        {
          "name": "fractionalTokenMint",
          "docs": [
            "Fractional token mint created for this NFT (STANDARD SPL TOKEN)"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "vaultFractionalAccount",
          "docs": [
            "Fractional token account for the vault"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "fractionalTokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "creatorNftAccount",
          "docs": [
            "Creator's NFT token account"
          ],
          "writable": true
        },
        {
          "name": "vaultNftAccount",
          "docs": [
            "Vault's NFT token account"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "originalNftMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "creatorPaymentAccount",
          "docs": [
            "Creator's payment account for receiving proceeds from sales"
          ]
        },
        {
          "name": "tokenProgram",
          "docs": [
            "Token program for standard SPL tokens"
          ],
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "docs": [
            "Associated token program for creating ATAs"
          ],
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "docs": [
            "System program for account creation"
          ],
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "docs": [
            "Rent sysvar"
          ],
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "totalFractions",
          "type": "u64"
        },
        {
          "name": "pricePerFraction",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initialize",
      "docs": [
        "Initialize the platform with default configuration"
      ],
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "admin",
          "docs": [
            "The platform admin initializing the program"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "platformConfig",
          "docs": [
            "Platform configuration account"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "docs": [
            "System program for account creation"
          ],
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "redeem",
      "docs": [
        "Redeem NFT by burning all fractional tokens (SIMPLIFIED FOR HACKATHON)",
        "",
        "This instruction allows a user who owns all fractional tokens to redeem the original NFT."
      ],
      "discriminator": [
        184,
        12,
        86,
        149,
        70,
        196,
        97,
        225
      ],
      "accounts": [
        {
          "name": "redeemer",
          "docs": [
            "The user redeeming the NFT (must own all fractional tokens)"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "vault",
          "docs": [
            "The vault containing the NFT"
          ],
          "writable": true
        },
        {
          "name": "originalNftMint",
          "docs": [
            "Original NFT mint"
          ]
        },
        {
          "name": "fractionalTokenMint",
          "docs": [
            "Fractional token mint"
          ],
          "writable": true
        },
        {
          "name": "redeemerFractionalAccount",
          "docs": [
            "Redeemer's fractional token account"
          ],
          "writable": true
        },
        {
          "name": "vaultNftAccount",
          "docs": [
            "Vault's NFT token account"
          ],
          "writable": true
        },
        {
          "name": "redeemerNftAccount",
          "docs": [
            "Redeemer's NFT token account"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "redeemer"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "originalNftMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "kycAccount",
          "docs": [
            "Redeemer's KYC account for compliance verification"
          ]
        },
        {
          "name": "tokenProgram",
          "docs": [
            "Token program for standard SPL tokens"
          ],
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "docs": [
            "Associated token program for creating ATAs"
          ],
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "docs": [
            "System program for account creation"
          ],
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "registerKyc",
      "docs": [
        "Register a user for KYC verification (hackathon-friendly)",
        "",
        "This instruction creates a simple KYC account for a user with minimal requirements.",
        "Perfect for hackathon demos where you want to show the flow without barriers."
      ],
      "discriminator": [
        230,
        67,
        245,
        42,
        249,
        254,
        177,
        166
      ],
      "accounts": [
        {
          "name": "user",
          "docs": [
            "The user registering for KYC verification"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "kycAccount",
          "docs": [
            "KYC account to be created for the user"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  105,
                  109,
                  112,
                  108,
                  101,
                  95,
                  107,
                  121,
                  99
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "docs": [
            "System program for account creation"
          ],
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "updatePlatformConfig",
      "docs": [
        "Update platform configuration (admin only)"
      ],
      "discriminator": [
        195,
        60,
        76,
        129,
        146,
        45,
        67,
        143
      ],
      "accounts": [
        {
          "name": "admin",
          "docs": [
            "The platform admin updating configuration"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "platformConfig",
          "docs": [
            "Platform configuration account"
          ],
          "writable": true
        }
      ],
      "args": [
        {
          "name": "platformFeeNumerator",
          "type": "u16"
        },
        {
          "name": "platformFeeDenominator",
          "type": "u16"
        },
        {
          "name": "minInvestmentAmount",
          "type": "u64"
        },
        {
          "name": "maxInvestmentAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "verifyKyc",
      "docs": [
        "Verify a user's KYC status (admin only)",
        "",
        "This instruction allows platform admins to manually verify users.",
        "This is the main verification method for hackathon demos."
      ],
      "discriminator": [
        102,
        127,
        254,
        101,
        12,
        246,
        86,
        71
      ],
      "accounts": [
        {
          "name": "admin",
          "docs": [
            "The admin verifying the KYC status"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "kycAccount",
          "docs": [
            "The KYC account to be verified"
          ],
          "writable": true
        },
        {
          "name": "platformConfig",
          "docs": [
            "Platform configuration for admin authority validation"
          ]
        }
      ],
      "args": [
        {
          "name": "verificationMethod",
          "type": {
            "defined": {
              "name": "verificationMethod"
            }
          }
        },
        {
          "name": "verificationLevel",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "platformConfig",
      "discriminator": [
        160,
        78,
        128,
        0,
        248,
        83,
        230,
        160
      ]
    },
    {
      "name": "simpleKycAccount",
      "discriminator": [
        20,
        188,
        209,
        137,
        86,
        36,
        206,
        109
      ]
    },
    {
      "name": "vault",
      "discriminator": [
        211,
        8,
        232,
        43,
        2,
        152,
        117,
        119
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidTotalFractions",
      "msg": "Invalid total fractions - must be greater than 0"
    },
    {
      "code": 6001,
      "name": "invalidPrice",
      "msg": "Invalid price per fraction - must be greater than 0"
    },
    {
      "code": 6002,
      "name": "invalidRoyaltyFee",
      "msg": "Invalid royalty fee - numerator must be <= denominator and denominator > 0"
    },
    {
      "code": 6003,
      "name": "saleNotActive",
      "msg": "Sale is not active"
    },
    {
      "code": 6004,
      "name": "invalidAmount",
      "msg": "Invalid amount - must be greater than 0"
    },
    {
      "code": 6005,
      "name": "insufficientFractions",
      "msg": "Insufficient fractions available for purchase"
    },
    {
      "code": 6006,
      "name": "kycNotVerified",
      "msg": "KYC verification required to purchase fractions"
    },
    {
      "code": 6007,
      "name": "insufficientTokens",
      "msg": "Insufficient tokens for redemption - must own all fractional tokens"
    },
    {
      "code": 6008,
      "name": "mathOverflow",
      "msg": "Math overflow occurred during calculation"
    },
    {
      "code": 6009,
      "name": "unauthorizedAccess",
      "msg": "Unauthorized access - admin authority required"
    },
    {
      "code": 6010,
      "name": "vaultNotReadyForRedemption",
      "msg": "Vault is not ready for redemption - not all fractions sold"
    },
    {
      "code": 6011,
      "name": "invalidVaultState",
      "msg": "Invalid vault state"
    },
    {
      "code": 6012,
      "name": "tokenAccountMismatch",
      "msg": "Token account mismatch"
    },
    {
      "code": 6013,
      "name": "insufficientPaymentFunds",
      "msg": "Payment account insufficient funds"
    },
    {
      "code": 6014,
      "name": "platformAuthorityMismatch",
      "msg": "Platform authority mismatch"
    },
    {
      "code": 6015,
      "name": "kycAccountAlreadyExists",
      "msg": "KYC account already exists"
    },
    {
      "code": 6016,
      "name": "kycAccountNotFound",
      "msg": "KYC account not found"
    },
    {
      "code": 6017,
      "name": "vaultAccountAlreadyExists",
      "msg": "Vault account already exists"
    },
    {
      "code": 6018,
      "name": "fractionalMintAlreadyExists",
      "msg": "Fractional token mint already exists"
    },
    {
      "code": 6019,
      "name": "invalidTokenProgram",
      "msg": "Invalid token program"
    },
    {
      "code": 6020,
      "name": "invalidToken2022Program",
      "msg": "Invalid token 2022 program"
    },
    {
      "code": 6021,
      "name": "invalidVerificationCode",
      "msg": "Invalid verification code"
    },
    {
      "code": 6022,
      "name": "invalidDocumentData",
      "msg": "Invalid document data"
    },
    {
      "code": 6023,
      "name": "invalidKycProvider",
      "msg": "Invalid KYC provider"
    },
    {
      "code": 6024,
      "name": "kycVerificationLimitExceeded",
      "msg": "KYC verification limit exceeded"
    },
    {
      "code": 6025,
      "name": "invalidVerificationId",
      "msg": "Invalid verification ID"
    },
    {
      "code": 6026,
      "name": "kycRefreshNotAllowed",
      "msg": "KYC refresh not allowed"
    },
    {
      "code": 6027,
      "name": "kycComplianceIncomplete",
      "msg": "KYC compliance incomplete"
    },
    {
      "code": 6028,
      "name": "kycRiskLevelTooHigh",
      "msg": "KYC risk level too high"
    },
    {
      "code": 6029,
      "name": "invalidNftMint",
      "msg": "Invalid NFT mint - token account does not hold the expected NFT"
    },
    {
      "code": 6030,
      "name": "ownerMismatch",
      "msg": "Owner mismatch - token account owner does not match creator"
    },
    {
      "code": 6031,
      "name": "notAnNft",
      "msg": "Not an NFT - token account must contain exactly 1 token"
    },
    {
      "code": 6032,
      "name": "incorrectPaymentAccount",
      "msg": "Incorrect payment account - must match the creator's stored payment account"
    },
    {
      "code": 6033,
      "name": "invalidFractionalMint",
      "msg": "Invalid fractional mint - token account mint does not match expected fractional token mint"
    }
  ],
  "types": [
    {
      "name": "platformConfig",
      "docs": [
        "Platform configuration account for managing platform-wide settings",
        "",
        "This account stores platform configuration including fee structures,",
        "admin authorities, and other global settings."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "docs": [
              "Platform admin authority"
            ],
            "type": "pubkey"
          },
          {
            "name": "platformFeeBps",
            "docs": [
              "Platform fee percentage (basis points, e.g., 500 = 5%)"
            ],
            "type": "u16"
          },
          {
            "name": "creatorFeeBps",
            "docs": [
              "Creator fee percentage (basis points, e.g., 9500 = 95%)"
            ],
            "type": "u16"
          },
          {
            "name": "defaultRoyaltyBps",
            "docs": [
              "Default royalty fee for fractional tokens (basis points)"
            ],
            "type": "u16"
          },
          {
            "name": "treasury",
            "docs": [
              "Platform treasury wallet for collecting fees"
            ],
            "type": "pubkey"
          },
          {
            "name": "isActive",
            "docs": [
              "Whether the platform is currently active"
            ],
            "type": "bool"
          },
          {
            "name": "initializedAt",
            "docs": [
              "Timestamp when the platform was initialized"
            ],
            "type": "i64"
          },
          {
            "name": "platformFeeNumerator",
            "docs": [
              "Platform fee numerator for legacy compatibility"
            ],
            "type": "u16"
          },
          {
            "name": "platformFeeDenominator",
            "docs": [
              "Platform fee denominator for legacy compatibility"
            ],
            "type": "u16"
          },
          {
            "name": "minInvestmentAmount",
            "docs": [
              "Minimum investment amount"
            ],
            "type": "u64"
          },
          {
            "name": "maxInvestmentAmount",
            "docs": [
              "Maximum investment amount"
            ],
            "type": "u64"
          },
          {
            "name": "updatedAt",
            "docs": [
              "Last update timestamp"
            ],
            "type": "i64"
          },
          {
            "name": "createdAt",
            "docs": [
              "Created at timestamp"
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "simpleKycAccount",
      "docs": [
        "Simplified KYC account for our own implementation",
        "",
        "This account stores basic KYC information for our hackathon demo.",
        "Focuses on essential fields without complex provider integrations."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "docs": [
              "The user's wallet address"
            ],
            "type": "pubkey"
          },
          {
            "name": "isVerified",
            "docs": [
              "KYC verification status"
            ],
            "type": "bool"
          },
          {
            "name": "verificationMethod",
            "docs": [
              "Verification method used"
            ],
            "type": {
              "defined": {
                "name": "verificationMethod"
              }
            }
          },
          {
            "name": "verifiedAt",
            "docs": [
              "Timestamp when KYC was completed"
            ],
            "type": "i64"
          },
          {
            "name": "email",
            "docs": [
              "Optional: User's email for notifications"
            ],
            "type": {
              "option": "string"
            }
          },
          {
            "name": "country",
            "docs": [
              "Optional: User's country for compliance"
            ],
            "type": {
              "option": "string"
            }
          },
          {
            "name": "verificationLevel",
            "docs": [
              "Verification level (1-3)"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "vault",
      "docs": [
        "Vault account that stores the original NFT and manages fractional token sales",
        "",
        "This account acts as the central hub for the fractionalization process:",
        "- Stores the original NFT in a secure vault",
        "- Manages the fractional token mint",
        "- Tracks sales progress and pricing",
        "- Controls the redemption process"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "docs": [
              "The original owner of the NFT being fractionalized"
            ],
            "type": "pubkey"
          },
          {
            "name": "originalNftMint",
            "docs": [
              "The mint address of the original NFT locked in the vault"
            ],
            "type": "pubkey"
          },
          {
            "name": "fractionalTokenMint",
            "docs": [
              "The mint address of the fractional tokens created from the NFT"
            ],
            "type": "pubkey"
          },
          {
            "name": "totalFractions",
            "docs": [
              "Total number of fractional shares created"
            ],
            "type": "u64"
          },
          {
            "name": "pricePerFraction",
            "docs": [
              "Price per fractional share in lamports (or smallest unit of payment token)"
            ],
            "type": "u64"
          },
          {
            "name": "fractionsSold",
            "docs": [
              "Number of fractional shares sold so far"
            ],
            "type": "u64"
          },
          {
            "name": "isSaleActive",
            "docs": [
              "Whether the sale is currently active"
            ],
            "type": "bool"
          },
          {
            "name": "createdAt",
            "docs": [
              "Timestamp when the vault was created"
            ],
            "type": "i64"
          },
          {
            "name": "saleEndedAt",
            "docs": [
              "Optional: Timestamp when the sale ended"
            ],
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "creatorPaymentAccount",
            "docs": [
              "Creator's payment account for receiving proceeds from sales"
            ],
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "verificationMethod",
      "docs": [
        "Simple verification methods for our implementation"
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "adminApproval"
          },
          {
            "name": "emailVerification"
          },
          {
            "name": "socialVerification"
          },
          {
            "name": "documentUpload"
          },
          {
            "name": "phoneVerification"
          }
        ]
      }
    }
  ]
};
