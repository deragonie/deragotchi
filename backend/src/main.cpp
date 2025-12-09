#include "deragotchi.h"
#include <iostream>
#include <fstream>
#include <sstream>
#include <thread>
#include <chrono>
#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>
#include <cstring>

using namespace std;

class SimpleHTTPServer {
private:
    int server_fd;
    deragotchi pet;
    
public:
    SimpleHTTPServer(int port) : pet("Deragotchi") {
        startServer(port);
    }
    
    void startServer(int port) {
        server_fd = socket(AF_INET, SOCK_STREAM, 0);
        if (server_fd < 0) {
            cerr << "error en socket" << endl;
            exit(1);
        }
        int opt = 1;
        setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));
        struct sockaddr_in address;
        address.sin_family = AF_INET;
        address.sin_addr.s_addr = INADDR_ANY;
        address.sin_port = htons(port);
        if (bind(server_fd, (struct sockaddr*)&address, sizeof(address)) < 0) {
            cerr << " error en bind - ¿puerto " << port << " ocupado?" << endl;
            exit(1);
        }
        if (listen(server_fd, 5) < 0) {
            cerr << "error on listen" << endl;
            exit(1);
        }
        
        cout << "server starting on http://localhost:" << port << endl;
        cout << "tamagotchi: " << pet.getName() << " is ready!" << endl;
        cout << "using archives from: ../../frontend/" << endl;
        
        run();
    }
    
    void run() {
        while (true) {
            struct sockaddr_in client_addr;
            socklen_t addr_len = sizeof(client_addr);
            int client_socket = accept(server_fd, (struct sockaddr*)&client_addr, &addr_len);
            if (client_socket < 0) {
                cerr << "error accepting connection" << endl;
                continue;
            }
            thread([this, client_socket]() {
                handleRequest(client_socket);
            }).detach();
        }
    }
    
    void handleRequest(int client_socket) {
        char buffer[4096] = {0};
        ssize_t bytes_read = read(client_socket, buffer, sizeof(buffer) - 1);
        
        if (bytes_read <= 0) {
            close(client_socket);
            return;
        }
        
        string request(buffer);
        string response;
        
        pet.upd();
        
        if (request.find("GET /status") != string::npos) {
            response = createResponse(pet.toJSON(), "application/json");
        }
        else if (request.find("POST /feed") != string::npos) {
            pet.feed();
            response = createResponse("{\"action\":\"feed\",\"success\":true}", "application/json");
        }
        else if (request.find("POST /play") != string::npos) {
            pet.play();
            response = createResponse("{\"action\":\"play\",\"success\":true}", "application/json");
        }
        else if (request.find("POST /sleep") != string::npos) {
            pet.sleep();
            response = createResponse("{\"action\":\"sleep\",\"success\":true}", "application/json");
        }
        else if (request.find("POST /clean") != string::npos) {
            pet.clean();
            response = createResponse("{\"action\":\"clean\",\"success\":true}", "application/json");
        }
        else if (request.find("POST /wake") != string::npos) {
            pet.wakeywakey();
            response = createResponse("{\"action\":\"wake\",\"success\":true}", "application/json");
        }
        else {
            response = serveStaticFile(request);
        }
        
        send(client_socket, response.c_str(), response.length(), 0);
        close(client_socket);
    }
    
    string serveStaticFile(const string& request) {
        size_t start = request.find("GET /");
        if (start == string::npos) {
            return createResponse("400 Bad Request", "text/plain", "400 Bad Request");
        }
        
        size_t end = request.find(" HTTP/", start);
        if (end == string::npos) {
            return createResponse("400 Bad Request", "text/plain", "400 Bad Request");
        }
        
        string path = request.substr(start + 4, end - start - 4);
        
        string filepath;
        if (path == "/" || path == "/index.html") {
            filepath = "../../frontend/index.html";
        }
        else if (path == "/style.css") {
            filepath = "../../frontend/style.css";
        }
        else if (path == "/script.js") {
            filepath = "../../frontend/script.js";
        }
        else if (path.find("/assets/") == 0) {
            filepath = "../../frontend" + path;
        }
        else {
            return createResponse("404 Not Found", "text/plain", "404 Not Found");
        }
        
        ifstream file(filepath, ios::binary);
        if (!file) {
            cerr << "file not found: " << filepath << endl;
            return createResponse("404 Not Found", "text/plain", "404 Not Found");
        }
        
        stringstream content;
        content << file.rdbuf();
        
        string contentType = "text/plain";
        if (filepath.find(".html") != string::npos) contentType = "text/html";
        else if (filepath.find(".css") != string::npos) contentType = "text/css";
        else if (filepath.find(".js") != string::npos) contentType = "application/javascript";
        else if (filepath.find(".png") != string::npos) contentType = "image/png";
        else if (filepath.find(".jpg") != string::npos) contentType = "image/jpeg";
        
        return createResponse(content.str(), contentType);
    }
    
    string createResponse(const string& content, 
                         const string& contentType = "text/html",
                         const string& status = "200 OK") {
        stringstream response;
        response << "HTTP/1.1 " << status << "\r\n"
                 << "Content-Type: " << contentType << "\r\n"
                 << "Access-Control-Allow-Origin: *\r\n"
                 << "Content-Length: " << content.length() << "\r\n"
                 << "Connection: close\r\n"
                 << "\r\n"
                 << content;
        return response.str();
    }
    
    ~SimpleHTTPServer() {
        close(server_fd);
    }
};

int main() {
    char cwd[1024];
    getcwd(cwd, sizeof(cwd));
    cout << "current work directory: " << cwd << endl;
    
    cout << "=== ¡welcome to deragotchi server!  ===" << endl;
    cout << "system: archlinux" << endl;
    
    try {
        SimpleHTTPServer server(8080);
    } catch (const exception& e) {
        cerr << "fatal error: " << e.what() << endl;
        return 1;
    }
    
    return 0;
}
