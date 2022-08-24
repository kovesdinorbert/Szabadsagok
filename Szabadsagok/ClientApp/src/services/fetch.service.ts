
class RequestOptions {
    method: string = '';
    headers: any = {};
    body?: any;
  }

export class FetchService {

    public Get(token: string, url: string, data: any, successCb: any, failCb: any) {
        
        let requestOptions: RequestOptions = new RequestOptions();
        requestOptions.method = 'GET';
        requestOptions.headers = {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + token
                };
    // var requestOptions = {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': 'Bearer ' + token
    //     },
    //   };
      if (data) {
        requestOptions.body = JSON.stringify(data)
      }

      fetch(url, requestOptions)
        .then(async response => {
          if (!response.ok) {
            failCb();
          } else {
            successCb();
          };
        })
        .catch(error => {
        });
    }
};

