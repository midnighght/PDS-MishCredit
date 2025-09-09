import { Controller, Get, Query, HttpException, HttpStatus, Logger } from '@nestjs/common';

@Controller('proxy') // This creates /api/proxy/* routes
export class ProxyController {
  private readonly logger = new Logger(ProxyController.name);

  @Get('login')
  async proxyLogin(@Query('email') email: string, @Query('password') password: string) {
    this.logger.log(`Login attempt for email: ${email}`);
    
    try {
      if (!email || !password) {
        throw new HttpException('Email and password are required', HttpStatus.BAD_REQUEST);
      }

      const url = `https://puclaro.ucn.cl/eross/avance/login.php?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
      
      this.logger.debug(`Making request to: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        this.logger.error(`External API error: ${response.status}`);
        throw new HttpException(`External API error: ${response.status}`, HttpStatus.BAD_GATEWAY);
      }

      const data = await response.json();
      
      if (data.error) {
        this.logger.warn(`Login failed for ${email}: ${data.error}`);
        throw new HttpException(data.error, HttpStatus.UNAUTHORIZED);
      } else {
        this.logger.log(`Login successful for ${email}`);
      }
      
      return data;
    } catch (error) {
      this.logger.error('Proxy login error:', error.message);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Login request failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('malla')
  async proxyMalla(@Query('query') query: string) {
    this.logger.log(`Fetching malla for query: ${query}`);
    
    try {
      if (!query) {
        throw new HttpException('Query parameter is required', HttpStatus.BAD_REQUEST);
      }

      const url = `https://losvilos.ucn.cl/hawaii/api/mallas?${query}`;
      
      this.logger.debug(`Making request to: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-HAWAII-AUTH': 'jf400fejof13f'
        }
      });

      if (!response.ok) {
        this.logger.error(`External API error: ${response.status}`);
        throw new HttpException(`External API error: ${response.status}`, HttpStatus.BAD_GATEWAY);
      }

      const data = await response.json();
      this.logger.log(`Malla data fetched successfully for query: ${query}`);
      
      return data;
    } catch (error) {
      this.logger.error('Proxy malla error:', error.message);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Malla request failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('avance')
  async proxyAvance(@Query('rut') rut: string, @Query('codcarrera') codcarrera: string) {
    this.logger.log(`Fetching avance for RUT: ${rut}, Career: ${codcarrera}`);
    
    try {
      if (!rut || !codcarrera) {
        throw new HttpException('RUT and codcarrera are required', HttpStatus.BAD_REQUEST);
      }

      const url = `https://puclaro.ucn.cl/eross/avance/avance.php?rut=${encodeURIComponent(rut)}&codcarrera=${encodeURIComponent(codcarrera)}`;
      
      this.logger.debug(`Making request to: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        this.logger.error(`External API error: ${response.status}`);
        throw new HttpException(`External API error: ${response.status}`, HttpStatus.BAD_GATEWAY);
      }

      const data = await response.json();
      this.logger.log(`Avance data fetched successfully for RUT: ${rut}`);
      
      return data;
    } catch (error) {
      this.logger.error('Proxy avance error:', error.message);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Avance request failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}