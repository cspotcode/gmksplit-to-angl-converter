tsc --module commonjs --sourcemap @( ls -Recurse -Path src *.ts | % fullname )
#node src\test.js @( ls src/*.ts | % fullname )