﻿using System;

namespace Core.Exceptions
{
    public class BusinessLogicException: Exception
    {
        public BusinessLogicException()
        {
        }

        public BusinessLogicException(string message)
            : base(message)
        {
        }
    }
}
