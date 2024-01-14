import { AllExceptionsFilter } from './all-exceptions-filter.filter';
import { HttpAdapterHost, AbstractHttpAdapter } from '@nestjs/core';
import { Test } from '@nestjs/testing';

describe('AllExceptionsFilterFilter', () => {
  let mockHttpAdapterHost: HttpAdapterHost;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: HttpAdapterHost,
          useValue: {
            httpAdapter: {
              // Mock the methods you need
            },
          },
        },
      ],
    }).compile();

    mockHttpAdapterHost = moduleRef.get<HttpAdapterHost>(HttpAdapterHost);
  });

  it('should be defined', () => {
    expect(new AllExceptionsFilter(mockHttpAdapterHost)).toBeDefined();
  });
});
