## Name
Bitespeed Identity Reconciliation API

## Description

A way to keep track of a user's identity across multiple accounts

### App Live on Render
```
https://bitespeed-identity-reconciliation-tiyy.onrender.com/identify
```

### API documentation and test cases

```
POST: /identify
```

```
Request:
{
    "email": "abc@test.io",
    "phoneNumber": "37982789231"
}
Response:
{
    "contact": {
        "primaryContactId": 1,
        "emails": [
            "abc@test.io"
        ],
        "phoneNumbers": [
            "37982789231"
        ],
        "secondaryContactIds": []
    }
}
```

```
Request:
{
    "email": "abc1@test.io",
    "phoneNumber": "37982789231"
}
Response:
{
    "contact": {
        "primaryContactId": 1,
        "emails": [
            "abc@test.io",
            "abc1@test.io"
        ],
        "phoneNumbers": [
            "37982789231"
        ],
        "secondaryContactIds": [
            2
        ]
    }
}
```

```
Request:
{
    "email": "abc1@test.io",
    "phoneNumber": "37982789232"
}
Response:
{
    "contact": {
        "primaryContactId": 1,
        "emails": [
            "abc1@test.io",
            "abc@test.io"
        ],
        "phoneNumbers": [
            "37982789231",
            "37982789232"
        ],
        "secondaryContactIds": [
            2,
            3
        ]
    }
}
```

```
Request:
{
    "email": "abcd@test.io",
    "phoneNumber": "379827892321"
}
Response:
{
    "contact": {
        "primaryContactId": 4,
        "emails": [
            "abcd@test.io"
        ],
        "phoneNumbers": [
            "379827892321"
        ],
        "secondaryContactIds": []
    }
}
```

### Installation

```bash
$ yarn install
```

### Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

### Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Powered by Nestjs
<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>
