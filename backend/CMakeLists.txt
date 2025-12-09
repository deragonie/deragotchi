cmake_minimum_required(VERSION 3.10)
project(deragotchi_backend)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/include)

find_package(Threads REQUIRED)

add_executable(deragotchi_server
    src/main.cpp
    src/deragotchi.cpp
)

target_link_libraries(deragotchi_server 
    PRIVATE 
    Threads::Threads
)
